// Camada de Serviços - Banco de Dados Mockado (api.js)

const DEFAULT_ROUTES = [
  {
    id: "RT-8821",
    client: "Logística Norte PJ",
    neighborhood: "Industrial Park",
    time: "08:15 AM",
    driverName: "João Dias",
    initials: "JD",
    status: "Aguardando Início", // Aguardando Início, Em Rota, Pendente Pesagem, Concluída
    cnpj: "33.444.555/0001-22",
    address: "Av. do Contorno, 800 - Industrial Park, Maracanaú - CE",
    volume: "1.5m³",
    stopsRemaining: 6
  },
  {
    id: "RT-8825",
    client: "Supermercado Silva PJ",
    neighborhood: "Vila Nova",
    time: "09:30 AM",
    driverName: "Mauro Lima",
    initials: "ML",
    status: "Aguardando Início",
    cnpj: "22.333.444/0001-11",
    address: "Rua das Flores, 120 - Vila Nova, Eusébio - CE",
    volume: "800L",
    stopsRemaining: 3
  },
  {
    id: "RT-8830",
    client: "Indústria Têxtil PJ",
    neighborhood: "Centro Oeste",
    time: "10:45 AM",
    driverName: "Robson Silva",
    initials: "RS",
    status: "Aguardando Início",
    cnpj: "44.555.666/0001-33",
    address: "Av. Santos Dumont, 4500 - Centro Oeste, Fortaleza - CE",
    volume: "2.1m³",
    stopsRemaining: 8
  },
  {
    id: "RT-8810",
    client: "Central-Sul (Distribuidora)",
    driverName: "Carlos Andrade",
    routeName: "Central-Sul",
    progress: 65,
    status: "Em Rota",
    hasWarning: true,
    warningText: "Desvio Detectado",
    stopsRemaining: 5,
    cnpj: "12.843.112/0001-90",
    address: "Av. Washington Soares, 1200 - Edson Queiroz, Fortaleza - CE",
    volume: "12m³",
    schedule: "Hoje, 24/05 - Tarde",
    distanceText: "Motorista a 2.4km",
    initials: "CA"
  },
  {
    id: "RT-8812",
    client: "Mercado Central Varejo",
    driverName: "Robson Silva",
    routeName: "Zona Portuária",
    progress: 88,
    status: "Em Rota",
    isLive: true,
    stopsRemaining: 2,
    cnpj: "08.455.231/0001-11",
    address: "Rua Alberto Nepomuceno, 199 - Doca 4, Centro, Fortaleza - CE",
    volume: "850L",
    schedule: "Terça-feira, 30/06 - Manhã",
    confirmationText: "Confirmada via App",
    initials: "RS"
  },
  {
    id: "RT-8790",
    client: "Metalúrgica Gerdau",
    location: "Galpão A",
    estimatedWeight: "1200",
    status: "Pendente Pesagem",
    driverName: "Antônio Filho",
    cnpj: "77.888.999/0001-55",
    address: "Rodovia BR-116, Km 12 - Messejana, Fortaleza - CE",
    volume: "1.2m³",
    initials: "AF"
  },
  {
    id: "RT-8795",
    client: "Hospital Santa Clara",
    location: "Galpão B",
    estimatedWeight: "450",
    status: "Pendente Pesagem",
    driverName: "Robson Silva",
    cnpj: "88.999.000/0001-66",
    address: "Av. Pontes Vieira, 150 - Dionísio Torres, Fortaleza - CE",
    volume: "450L",
    initials: "RS"
  }
];

const DEFAULT_COLLECTIONS = [
  {
    id: "COL-4039",
    client: "Ceará Tech Solutions",
    cnpj: "45.221.908/0001-32",
    status: "CONCLUÍDA",
    address: "Rua dos Inconfidentes, 442, Bloco B, Sala 12, Aldeota, Fortaleza - CE",
    responsible: "Roberto Mendes",
    validatedWeight: 148,
    volume: "450L",
    routeId: null
  },
  {
    id: "COL-4045",
    client: "Indústrias Nordeste S.A.",
    cnpj: "12.843.112/0001-90",
    status: "EM ROTA",
    address: "Av. Washington Soares, 1200, Galpão de Logística, Edson Queiroz, Fortaleza - CE",
    schedule: "Hoje, 24/05 - Tarde",
    distanceText: "Motorista a 2.4km",
    volume: "12m³",
    routeId: "RT-8810",
    responsible: "Carlos Andrade"
  },
  {
    id: "COL-4052",
    client: "Mercado Central Varejo",
    cnpj: "08.455.231/0001-11",
    status: "EM ROTA",
    address: "Rua Alberto Nepomuceno, 199, Doca 4 - Entrada Sul, Centro, Fortaleza - CE",
    schedule: "Terça-feira, 30/06 - Manhã",
    confirmationText: "Confirmada via App",
    volume: "850L",
    routeId: "RT-8812",
    responsible: "Robson Silva"
  },
  {
    id: "COL-4053",
    client: "Hospital Santa Clara",
    cnpj: "88.999.000/0001-66",
    status: "EM ROTA",
    address: "Av. Pontes Vieira, 150 - Dionísio Torres, Fortaleza - CE",
    schedule: "Hoje - Tarde",
    distanceText: "Aguardando pesagem no pátio",
    volume: "450L",
    routeId: "RT-8795",
    responsible: "Robson Silva"
  },
  {
    id: "COL-3998",
    client: "Pague Menos Matriz",
    cnpj: "06.626.253/0001-51",
    status: "CONCLUÍDA",
    address: "Rua Senador Pompeu, 1520, Administrativo, Centro, Fortaleza - CE",
    responsible: "Amanda Souza",
    validatedWeight: 312,
    volume: "1.2m³",
    routeId: null
  }
];

class ApiService {
  constructor() {
    this._initDb();
  }

  _initDb() {
    if (!localStorage.getItem("coletty_routes")) {
      localStorage.setItem("coletty_routes", JSON.stringify(DEFAULT_ROUTES));
    }
    if (!localStorage.getItem("coletty_collections")) {
      localStorage.setItem("coletty_collections", JSON.stringify(DEFAULT_COLLECTIONS));
    }
  }

  _getRoutesRaw() {
    return JSON.parse(localStorage.getItem("coletty_routes"));
  }

  _saveRoutesRaw(routes) {
    localStorage.setItem("coletty_routes", JSON.stringify(routes));
  }

  _getCollectionsRaw() {
    return JSON.parse(localStorage.getItem("coletty_collections"));
  }

  _saveCollectionsRaw(collections) {
    localStorage.setItem("coletty_collections", JSON.stringify(collections));
  }

  _delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication Mock
  async login(email, password, role) {
    await this._delay(400);
    const normalizedEmail = String(email).trim().toLowerCase();
    
    if (role === "admin") {
      if (normalizedEmail === "admin@coletty.com" && password === "123") {
        return { email: normalizedEmail, name: "Administrador", role };
      }
    } else if (role === "coletor") {
      if (normalizedEmail === "coletor@coletty.com" && password === "123") {
        return { email: normalizedEmail, name: "Robson Silva", role };
      }
    }
    throw new Error("Usuário ou senha incorretos.");
  }

  // API Methods
  async getRoutes() {
    await this._delay(200);
    return this._getRoutesRaw();
  }

  async getCollections() {
    await this._delay(200);
    return this._getCollectionsRaw();
  }

  async createRoute(data) {
    await this._delay(400);
    const routes = this._getRoutesRaw();
    const collections = this._getCollectionsRaw();

    const routeId = `RT-${Math.floor(8800 + Math.random() * 200)}`;
    const collectionId = `COL-${Math.floor(4000 + Math.random() * 200)}`;

    const initials = data.driverName
      ? data.driverName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
      : "MO";

    const newRoute = {
      id: routeId,
      client: data.client || "Cliente Desconhecido",
      neighborhood: data.neighborhood || "Centro",
      time: data.time || "08:00 AM",
      driverName: data.driverName || "Motorista Não Atribuído",
      initials: initials,
      status: "Aguardando Início",
      cnpj: data.cnpj || "00.000.000/0000-00",
      address: data.address || "Sem endereço cadastrado",
      volume: data.volume || "0L",
      stopsRemaining: data.stopsRemaining || 5
    };

    const newCollection = {
      id: collectionId,
      client: data.client || "Cliente Desconhecido",
      cnpj: data.cnpj || "00.000.000/0000-00",
      status: "AGENDADA",
      address: data.address || "Sem endereço cadastrado",
      schedule: `Hoje - ${data.time || "Geral"}`,
      volume: data.volume || "0L",
      routeId: routeId,
      responsible: data.driverName || "Motorista Não Atribuído"
    };

    routes.unshift(newRoute);
    collections.unshift(newCollection);

    this._saveRoutesRaw(routes);
    this._saveCollectionsRaw(collections);

    return { route: newRoute, collection: newCollection };
  }

  async updateRouteStatus(routeId, newStatus) {
    await this._delay(300);
    const routes = this._getRoutesRaw();
    const collections = this._getCollectionsRaw();

    const route = routes.find(r => r.id === routeId);
    if (!route) throw new Error("Rota não encontrada");

    route.status = newStatus;

    if (newStatus === "Em Rota") {
      route.progress = route.progress || 10;
    } else if (newStatus === "Pendente Pesagem") {
      route.progress = 100;
      route.location = route.location || "Galpão A";
      route.estimatedWeight = route.estimatedWeight || (parseFloat(route.volume) ? parseFloat(route.volume) + "kg" : "500");
    }

    const collection = collections.find(c => c.routeId === routeId);
    if (collection) {
      if (newStatus === "Aguardando Início") {
        collection.status = "AGENDADA";
      } else if (newStatus === "Em Rota") {
        collection.status = "EM ROTA";
        collection.distanceText = "Em trânsito";
      } else if (newStatus === "Pendente Pesagem") {
        collection.status = "EM ROTA";
        collection.distanceText = "Aguardando pesagem no pátio";
      } else if (newStatus === "Concluída") {
        collection.status = "CONCLUÍDA";
      }
    }

    this._saveRoutesRaw(routes);
    this._saveCollectionsRaw(collections);

    return { route, collection };
  }

  async registerRealWeight(routeId, realWeight) {
    await this._delay(400);
    const routes = this._getRoutesRaw();
    const collections = this._getCollectionsRaw();

    const route = routes.find(r => r.id === routeId);
    if (!route) throw new Error("Rota não encontrada");

    route.status = "Concluída";
    route.realWeight = realWeight;

    let collection = collections.find(c => c.routeId === routeId);
    if (!collection) {
      const collectionId = `COL-${Math.floor(4000 + Math.random() * 200)}`;
      collection = {
        id: collectionId,
        client: route.client,
        cnpj: route.cnpj || "00.000.000/0000-00",
        status: "CONCLUÍDA",
        address: route.address || "Endereço não cadastrado",
        responsible: route.driverName,
        validatedWeight: realWeight,
        volume: route.volume || "N/A",
        routeId: route.id
      };
      collections.unshift(collection);
    } else {
      collection.status = "CONCLUÍDA";
      collection.validatedWeight = realWeight;
    }

    this._saveRoutesRaw(routes);
    this._saveCollectionsRaw(collections);

    return { route, collection };
  }

  async resetData() {
    localStorage.removeItem("coletty_routes");
    localStorage.removeItem("coletty_collections");
    this._initDb();
    return true;
  }
}

export const api = new ApiService();
