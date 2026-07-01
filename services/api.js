// Camada de Serviços - Banco de Dados Supabase (api.js)

const SUPABASE_URL = 'https://otkhntqelnjuzfcfueqb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90a2hudHFlbG5qdXpmY2Z1ZXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MjI5OTgsImV4cCI6MjA5ODQ5ODk5OH0.8RrR5bKhNlKZ3so_js0XkHCVFKppoxqdIwVo9cpNy9A';

// Criação do cliente de conexão direta
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class ApiService {
  constructor() {
    this.supabase = supabaseClient;
  }

  // Método auxiliar de atraso visual (mantém o feedback de carregamento da interface original)
  _delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Autenticação Real no Supabase com Auto-Cadastro para Desenvolvimento
  async login(email, password, role) {
    await this._delay(400);
    const normalizedEmail = String(email).trim().toLowerCase();
    
    let authData = null;
    let authError = null;

    // 1. Tentar Login
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password
      });
      authData = data;
      authError = error;
    } catch (e) {
      authError = e;
    }

    // 2. Se falhar, tentar Auto-Cadastro (para facilitar os testes locais)
    if (authError) {
      const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            name: role === 'admin' ? 'Administrador' : 'Robson Silva',
            role: role
          }
        }
      });

      if (signUpError) {
        throw new Error(authError.message || signUpError.message || "Usuário ou senha incorretos.");
      }
      authData = signUpData;
    }

    // 3. Garantir o Perfil na tabela public.funcionarios
    if (authData && authData.user) {
      const userId = authData.user.id;
      
      const { data: profile } = await this.supabase
        .from('funcionarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (!profile) {
        const newProfile = {
          id: userId,
          email: normalizedEmail,
          name: role === 'admin' ? 'Administrador' : 'Robson Silva',
          role: role
        };
        const { error: profileError } = await this.supabase.from('funcionarios').insert(newProfile);
        if (profileError) throw profileError;
        
        return { email: normalizedEmail, name: newProfile.name, role: newProfile.role };
      } else {
        if (profile.role !== role) {
          throw new Error(`Este usuário está cadastrado como '${profile.role}' e não como '${role}'.`);
        }
        return { email: normalizedEmail, name: profile.name, role: profile.role };
      }
    }
    
    throw new Error("Erro desconhecido na autenticação.");
  }

  // Buscar Veículos cadastrados
  async getVehicles() {
    await this._delay(200);
    const { data, error } = await this.supabase
      .from('veiculos')
      .select('*')
      .order('plate');
    if (error) throw error;
    return data;
  }

  // Buscar Rotas (Join Relacional com cálculo dinâmico de SLA/Warnings)
  async getRoutes() {
    await this._delay(200);
    
    // 1. Buscar todas as rotas ativas
    const { data: dbRoutes, error: routeError } = await this.supabase
      .from('rotas')
      .select(`
        id,
        status,
        progress,
        has_warning,
        warning_text,
        start_time,
        started_at,
        finished_at,
        stops_remaining,
        funcionarios (
          name,
          role
        ),
        veiculos (
          id,
          plate,
          model
        ),
        coletas (
          id,
          status,
          volume,
          real_weight,
          estimated_weight,
          doadores (
            name,
            cnpj,
            address,
            neighborhood
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (routeError) {
      console.error("Erro ao buscar rotas no Supabase:", routeError);
      throw routeError;
    }

    // 2. Buscar todas as coletas avulsas (sem rota, status 'Solicitada')
    const { data: dbUnassigned, error: unassignedError } = await this.supabase
      .from('coletas')
      .select(`
        id,
        status,
        volume,
        real_weight,
        estimated_weight,
        doadores (
          name,
          cnpj,
          address,
          neighborhood
        )
      `)
      .is('route_id', null)
      .order('created_at', { ascending: false });

    if (unassignedError) {
      console.error("Erro ao buscar coletas avulsas:", unassignedError);
      throw unassignedError;
    }

    const now = new Date();

    // 3. Mapear rotas reais
    const mappedRoutes = dbRoutes.map(r => {
      const primaryColeta = r.coletas && r.coletas[0] ? r.coletas[0] : null;
      const donor = primaryColeta && primaryColeta.doadores ? primaryColeta.doadores : null;
      
      const driverName = r.funcionarios ? r.funcionarios.name : 'Motorista Não Atribuído';
      const initials = driverName
        ? driverName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
        : "MO";

      let hasWarning = r.has_warning;
      let warningText = r.warning_text;

      // Cálculo de alertas (SLA) dinâmicos com base em tempo
      if (r.status === 'Em Rota' && r.started_at) {
        const diffMinutes = Math.floor((now - new Date(r.started_at)) / 60000);
        
        // Alerta se estiver na rua há mais de 30 minutos
        if (diffMinutes > 30) {
          hasWarning = true;
          warningText = `Em rota há ${diffMinutes} min`;
        }
      } else if (r.status === 'Pendente Pesagem' && r.finished_at) {
        const diffMinutes = Math.floor((now - new Date(r.finished_at)) / 60000);
        
        // Alerta se estiver aguardando na balança há mais de 15 minutos
        if (diffMinutes > 15) {
          hasWarning = true;
          warningText = `Fila da Balança: ${diffMinutes} min`;
        }
      }

      return {
        id: r.id,
        client: donor ? donor.name : 'Cliente Desconhecido',
        neighborhood: donor ? donor.neighborhood : 'Centro',
        time: r.start_time,
        driverName: driverName,
        initials: initials,
        status: r.status,
        cnpj: donor ? donor.cnpj : '',
        address: donor ? donor.address : '',
        volume: primaryColeta ? primaryColeta.volume : '0L',
        stopsRemaining: r.stops_remaining || (r.coletas ? r.coletas.filter(c => c.status !== 'Concluída' && c.status !== 'CONCLUÍDA').length : 5),
        progress: r.progress || 0,
        hasWarning: hasWarning,
        warningText: warningText,
        realWeight: primaryColeta ? primaryColeta.real_weight : null,
        location: primaryColeta && primaryColeta.doadores ? primaryColeta.doadores.neighborhood : '',
        estimatedWeight: primaryColeta ? primaryColeta.estimated_weight : null,
        vehiclePlate: r.veiculos ? r.veiculos.plate : '',
        vehicleModel: r.veiculos ? r.veiculos.model : '',
        coletas: r.coletas ? r.coletas.map(c => ({
          id: c.id,
          status: c.status,
          volume: c.volume,
          estimatedWeight: c.estimated_weight,
          realWeight: c.real_weight,
          client: c.doadores ? c.doadores.name : 'Cliente',
          address: c.doadores ? c.doadores.address : '',
          neighborhood: c.doadores ? c.doadores.neighborhood : ''
        })) : []
      };
    });

    // 4. Mapear coletas avulsas para exibição como cartões na coluna "Aguardando Início"
    const virtualRoutes = (dbUnassigned || []).map(c => {
      const donor = c.doadores;
      return {
        id: c.id, // Mantém o ID da coleta como chave
        isCollectionOnly: true,
        client: donor ? donor.name : 'Cliente Desconhecido',
        neighborhood: donor ? donor.neighborhood : 'Centro',
        time: 'Agendada',
        driverName: 'Não Atribuído',
        initials: '--',
        status: 'Aguardando Início', // Vai para o Kanban "Aguardando Início"
        cnpj: donor ? donor.cnpj : '',
        address: donor ? donor.address : '',
        volume: c.volume || '0L',
        stopsRemaining: 1,
        progress: 0,
        hasWarning: false,
        warningText: '',
        realWeight: null,
        location: donor ? donor.neighborhood : '',
        estimatedWeight: c.estimated_weight,
        vehiclePlate: '',
        vehicleModel: '',
        coletas: [{
          id: c.id,
          status: c.status,
          volume: c.volume,
          estimatedWeight: c.estimated_weight,
          realWeight: c.real_weight,
          client: donor ? donor.name : 'Cliente',
          address: donor ? donor.address : '',
          neighborhood: donor ? donor.neighborhood : ''
        }]
      };
    });

    return [...mappedRoutes, ...virtualRoutes];
  }

  // Buscar Histórico de Coletas
  async getCollections() {
    await this._delay(200);
    const { data, error } = await this.supabase
      .from('coletas')
      .select(`
        id,
        status,
        volume,
        real_weight,
        estimated_weight,
        route_id,
        rotas (
          id,
          start_time,
          funcionarios (
            name
          )
        ),
        doadores (
          name,
          cnpj,
          address,
          neighborhood
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao buscar coletas no Supabase:", error);
      throw error;
    }

    return data.map(c => {
      const donor = c.doadores;
      const route = c.rotas;
      const driverName = route && route.funcionarios ? route.funcionarios.name : 'Motorista Não Atribuído';

      return {
        id: c.id,
        client: donor ? donor.name : 'Cliente Desconhecido',
        cnpj: donor ? donor.cnpj : '',
        status: c.status,
        address: donor ? `${donor.address} - ${donor.neighborhood}` : 'Endereço não cadastrado',
        responsible: driverName,
        validatedWeight: c.real_weight,
        volume: c.volume || '0L',
        routeId: c.route_id,
        schedule: route ? `Hoje - ${route.start_time}` : 'Hoje'
      };
    });
  }

  // Criar Nova Solicitação de Coleta (sem motorista e veículo inicialmente)
  async createRoute(data) {
    await this._delay(400);
    const collectionId = `COL-${Math.floor(1000 + Math.random() * 9000)}`;

    const donorCnpj = data.cnpj || "00.000.000/0000-00";
    let donorId;

    // 1. Assegurar Doador no Banco
    const { data: existingDonor } = await this.supabase
      .from('doadores')
      .select('id')
      .eq('cnpj', donorCnpj)
      .maybeSingle();

    if (existingDonor) {
      donorId = existingDonor.id;
    } else {
      const { data: newDonor, error: donorError } = await this.supabase
        .from('doadores')
        .insert({
          name: data.client || "Cliente Desconhecido",
          cnpj: donorCnpj,
          address: data.address || "Sem endereço cadastrado",
          neighborhood: data.neighborhood || "Centro"
        })
        .select('id')
        .single();
      
      if (donorError) throw donorError;
      donorId = newDonor.id;
    }

    // 2. Criar Coleta avulsa (status 'Solicitada')
    const { error: collectionError } = await this.supabase
      .from('coletas')
      .insert({
        id: collectionId,
        route_id: null,
        donor_id: donorId,
        status: "Solicitada",
        volume: data.volume || "0L",
        estimated_weight: parseFloat(data.estimatedWeight) || 50
      });

    if (collectionError) throw collectionError;

    return { collection: { id: collectionId } };
  }

  // Criar Rota Dinâmica no início do dia pelo motorista
  async startDynamicRoute(driverName, vehicleId, collectionIds) {
    await this._delay(400);
    const routeId = `RT-${Math.floor(8800 + Math.random() * 200)}`;
    
    // 1. Encontrar o ID do funcionário logado
    let driverId = null;
    const { data: driver } = await this.supabase
      .from('funcionarios')
      .select('id')
      .eq('name', driverName)
      .maybeSingle();
      
    if (driver) {
      driverId = driver.id;
    }

    // 2. Inserir a nova rota com status 'Em Rota'
    const { error: routeError } = await this.supabase
      .from('rotas')
      .insert({
        id: routeId,
        driver_id: driverId,
        vehicle_id: vehicleId,
        status: 'Em Rota',
        progress: 30,
        start_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        started_at: new Date().toISOString(),
        stops_remaining: collectionIds.length
      });

    if (routeError) throw routeError;

    // 3. Vincular as coletas selecionadas à rota criada e mudar status para 'Em Rota'
    const { error: collectionError } = await this.supabase
      .from('coletas')
      .update({
        route_id: routeId,
        status: 'Em Rota'
      })
      .in('id', collectionIds);

    if (collectionError) throw collectionError;

    return routeId;
  }

  // Motorista confirma a coleta física no Doador
  async confirmCollectionPickup(collectionId) {
    await this._delay(300);
    const { error } = await this.supabase
      .from('coletas')
      .update({
        status: 'Coletado'
      })
      .eq('id', collectionId);

    if (error) throw error;
    return true;
  }

  // Motorista finaliza a rota ao chegar no Instituto
  async finalizeRoute(routeId) {
    await this._delay(400);
    const { error } = await this.supabase
      .from('rotas')
      .update({
        status: 'Pendente Pesagem',
        finished_at: new Date().toISOString(),
        progress: 100
      })
      .eq('id', routeId);

    if (error) throw error;
    return true;
  }

  // Atualizar Status Geral (Mantido para compatibilidade, mas ajustado internamente)
  async updateRouteStatus(routeId, newStatus) {
    if (newStatus === 'Pendente Pesagem') {
      return this.finalizeRoute(routeId);
    }
    
    await this._delay(300);
    const { error } = await this.supabase
      .from('rotas')
      .update({ status: newStatus })
      .eq('id', routeId);
      
    if (error) throw error;
    return true;
  }

  // Registrar Peso Real na Balança Central do Instituto (Finaliza a rota)
  async registerRealWeight(routeId, realWeight) {
    await this._delay(400);

    // 1. Concluir Rota
    const { error: routeError } = await this.supabase
      .from('rotas')
      .update({
        status: "Concluída",
        progress: 100
      })
      .eq('id', routeId);

    if (routeError) throw routeError;

    // 2. Concluir Coletas vinculadas e registrar o peso homologado
    const { error: collectionError } = await this.supabase
      .from('coletas')
      .update({
        status: "Concluída",
        real_weight: realWeight
      })
      .eq('route_id', routeId);

    if (collectionError) throw collectionError;

    return true;
  }

  // Reiniciar Banco de Dados com a nova estrutura dinâmica
  async resetData() {
    await this._delay(500);

    // 1. Limpar tabelas antigas
    await this.supabase.from('coletas').delete().neq('id', 'dummy');
    await this.supabase.from('rotas').delete().neq('id', 'dummy');
    await this.supabase.from('doadores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await this.supabase.from('veiculos').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Criar Doadores Padrões
    const defaultDonors = [
      { name: "Logística Norte PJ", cnpj: "33.444.555/0001-22", address: "Av. do Contorno, 800 - Industrial Park, Maracanaú - CE", neighborhood: "Industrial Park" },
      { name: "Supermercado Silva PJ", cnpj: "22.333.444/0001-11", address: "Rua das Flores, 120 - Vila Nova, Eusébio - CE", neighborhood: "Vila Nova" },
      { name: "Indústria Têxtil PJ", cnpj: "44.555.666/0001-33", address: "Av. Santos Dumont, 4500 - Centro Oeste, Fortaleza - CE", neighborhood: "Centro Oeste" },
      { name: "Central-Sul (Distribuidora)", cnpj: "12.843.112/0001-90", address: "Av. Washington Soares, 1200 - Edson Queiroz, Fortaleza - CE", neighborhood: "Edson Queiroz" },
      { name: "Mercado Central Varejo", cnpj: "08.455.231/0001-11", address: "Rua Alberto Nepomuceno, 199 - Doca 4, Centro, Fortaleza - CE", neighborhood: "Centro" },
      { name: "Metalúrgica Gerdau", cnpj: "77.888.999/0001-55", address: "Rodovia BR-116, Km 12 - Messejana, Fortaleza - CE", neighborhood: "Messejana" },
      { name: "Hospital Santa Clara", cnpj: "88.999.000/0001-66", address: "Av. Pontes Vieira, 150 - Dionísio Torres, Fortaleza - CE", neighborhood: "Dionísio Torres" },
      { name: "Ceará Tech Solutions", cnpj: "45.221.908/0001-32", address: "Rua dos Inconfidentes, 442, Bloco B, Sala 12, Aldeota, Fortaleza - CE", neighborhood: "Aldeota" },
      { name: "Pague Menos Matriz", cnpj: "06.626.253/0001-51", address: "Rua Senador Pompeu, 1520, Administrativo, Centro, Fortaleza - CE", neighborhood: "Centro" }
    ];

    const { data: insertedDonors, error: donorError } = await this.supabase
      .from('doadores')
      .insert(defaultDonors)
      .select();

    if (donorError) throw donorError;

    // 3. Criar Veículos Padrões
    const defaultVehicles = [
      { plate: 'COL-2026', model: 'Mercedes-Benz Actros (Caminhão Baú)', capacity: 12000 },
      { plate: 'ECO-9988', model: 'Ford Cargo (Compactador)', capacity: 8000 },
      { plate: 'ELT-7766', model: 'BYD eDeliver3 (Elétrico)', capacity: 3000 },
      { plate: 'LOG-4433', model: 'Volkswagen Delivery', capacity: 6000 }
    ];

    const { data: insertedVehicles, error: vehicleError } = await this.supabase
      .from('veiculos')
      .insert(defaultVehicles)
      .select();

    if (vehicleError) throw vehicleError;

    // Obter ID do motorista
    const { data: driver } = await this.supabase
      .from('funcionarios')
      .select('id')
      .eq('role', 'coletor')
      .limit(1)
      .maybeSingle();
      
    const driverId = driver ? driver.id : null;
    const vehicleId = insertedVehicles[0]?.id;

    // 4. Criar Rotas Padrões
    const defaultRoutes = [
      { id: "RT-8810", driver_id: driverId, vehicle_id: vehicleId, status: "Em Rota", start_time: "02:00 PM", stops_remaining: 1, progress: 30, started_at: new Date(Date.now() - 40 * 60000).toISOString() }, // 40 min atrás (dispara warning)
      { id: "RT-8812", driver_id: driverId, vehicle_id: vehicleId, status: "Em Rota", start_time: "09:00 AM", stops_remaining: 1, progress: 30, started_at: new Date().toISOString() },
      { id: "RT-8790", driver_id: driverId, vehicle_id: vehicleId, status: "Pendente Pesagem", start_time: "11:00 AM", stops_remaining: 1, progress: 100, finished_at: new Date(Date.now() - 25 * 60000).toISOString() }, // 25 min atrás (dispara warning)
      { id: "RT-8795", driver_id: driverId, vehicle_id: vehicleId, status: "Pendente Pesagem", start_time: "03:00 PM", stops_remaining: 1, progress: 100, finished_at: new Date().toISOString() }
    ];

    const { error: routeError } = await this.supabase.from('rotas').insert(defaultRoutes);
    if (routeError) throw routeError;

    // 5. Criar Coletas Padrões (Solicitada, Em Rota, Coletado, Concluído)
    const getDonorId = (name) => insertedDonors.find(d => d.name === name)?.id;
    
    const defaultCollections = [
      // Concluídas
      { id: "COL-4039", donor_id: getDonorId("Ceará Tech Solutions"), status: "Concluída", real_weight: 148, volume: "450L", estimated_weight: 150 },
      { id: "COL-3998", donor_id: getDonorId("Pague Menos Matriz"), status: "Concluída", real_weight: 312, volume: "1.2m³", estimated_weight: 300 },
      
      // Em Rota (rotas ativas)
      { id: "COL-4045", route_id: "RT-8810", donor_id: getDonorId("Central-Sul (Distribuidora)"), status: "Em Rota", volume: "12m³", estimated_weight: 500 },
      { id: "COL-4052", route_id: "RT-8812", donor_id: getDonorId("Mercado Central Varejo"), status: "Em Rota", volume: "850L", estimated_weight: 300 },
      
      // Coletadas (rotas pendentes de pesagem)
      { id: "COL-4053", route_id: "RT-8795", donor_id: getDonorId("Hospital Santa Clara"), status: "Coletado", volume: "450L", estimated_weight: 400 },
      { id: "COL-1004", route_id: "RT-8790", donor_id: getDonorId("Metalúrgica Gerdau"), status: "Coletado", volume: "1.2m³", estimated_weight: 200 },
      
      // Solicitadas (Sem rota vinculada, aparecem em "Aguardando Início")
      { id: "COL-1001", route_id: null, donor_id: getDonorId("Logística Norte PJ"), status: "Solicitada", volume: "1.5m³", estimated_weight: 100 },
      { id: "COL-1002", route_id: null, donor_id: getDonorId("Supermercado Silva PJ"), status: "Solicitada", volume: "800L", estimated_weight: 80 },
      { id: "COL-1003", route_id: null, donor_id: getDonorId("Indústria Têxtil PJ"), status: "Solicitada", volume: "2.1m³", estimated_weight: 250 }
    ];

    const { error: collectionError } = await this.supabase.from('coletas').insert(defaultCollections);
    if (collectionError) throw collectionError;

    return true;
  }
}

export const api = new ApiService();
