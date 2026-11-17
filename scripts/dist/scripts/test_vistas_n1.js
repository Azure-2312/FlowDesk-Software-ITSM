"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var vistas_1 = require("../src/shared/lib/vistas");
var pg_1 = require("pg");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var envContent = "";
try {
    envContent = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
}
catch (_a) { }
var dbUrl = "";
envContent.split("\n").forEach(function (line) {
    if (line.startsWith("DATABASE_URL=")) {
        dbUrl = line.split("=")[1].trim().replace(/^["']|["']$/g, "");
    }
});
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function assert(cond, msg) {
            if (cond) {
                console.log("[PASS] ".concat(msg));
                passed++;
            }
            else {
                console.error("[FAIL] ".concat(msg));
                failed++;
            }
        }
        var passed, failed, pantallasKeys, totalVistas, inicio, desconocida, pool, tableRes, permitidasAdmin, puedeAdmin, puedeInexistente;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("================================================================================");
                    console.log("PRUEBAS UNITARIAS: INFRAESTRUCTURA DE VISTAS (N1 - FASE 1)");
                    console.log("================================================================================");
                    passed = 0;
                    failed = 0;
                    pantallasKeys = Object.keys(vistas_1.REGISTRO_VISTAS);
                    assert(pantallasKeys.length === 32, "Total de pantallas con vistas es 32 (obtenido: ".concat(pantallasKeys.length, ")"));
                    totalVistas = 0;
                    pantallasKeys.forEach(function (k) {
                        totalVistas += vistas_1.REGISTRO_VISTAS[k].vistas.length;
                    });
                    assert(totalVistas === 107, "Total de vistas registradas es 107 (obtenido: ".concat(totalVistas, ")"));
                    inicio = (0, vistas_1.obtenerRegistroVistas)("/plataforma/inicio");
                    assert(Boolean(inicio && inicio.vistas.length === 10), "Pantalla /plataforma/inicio tiene 10 vistas registradas");
                    desconocida = (0, vistas_1.obtenerRegistroVistas)("/plataforma/ruta-desconocida-xyz");
                    assert(desconocida === undefined, "Ruta no registrada devuelve undefined");
                    // 3. Vista por defecto por perfil en Inicio
                    assert((0, vistas_1.obtenerVistaPorDefecto)("/plataforma/inicio", 1) === "administrador", "Perfil 1 (Admin) recibe vista administrador");
                    assert((0, vistas_1.obtenerVistaPorDefecto)("/plataforma/inicio", 2) === "tecnico", "Perfil 2 (Técnico) recibe vista tecnico");
                    assert((0, vistas_1.obtenerVistaPorDefecto)("/plataforma/inicio", 3) === "solicitante", "Perfil 3 (Solicitante) recibe vista solicitante");
                    assert((0, vistas_1.obtenerVistaPorDefecto)("/plataforma/inicio", 6) === "auditor", "Perfil 6 (Auditor) recibe vista auditor");
                    pool = new pg_1.Pool({ connectionString: dbUrl });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 6, 8]);
                    return [4 /*yield*/, pool.query("\n      SELECT table_name FROM information_schema.tables \n      WHERE table_schema = 'public' AND table_name = 'opciones_menu_vistas_perfiles'\n    ")];
                case 2:
                    tableRes = _a.sent();
                    assert(tableRes.rows.length === 1, "Tabla opciones_menu_vistas_perfiles existe en la base de datos");
                    return [4 /*yield*/, (0, vistas_1.cargarVistasPermitidas)("/plataforma/incidentes/bandeja", 1)];
                case 3:
                    permitidasAdmin = _a.sent();
                    assert(permitidasAdmin.length === 5, "Admin tiene las 5 vistas de bandeja de incidentes (obtenido: ".concat(permitidasAdmin.length, ")"));
                    return [4 /*yield*/, (0, vistas_1.puedeVerVista)("/plataforma/incidentes/bandeja", "todos", 1)];
                case 4:
                    puedeAdmin = _a.sent();
                    assert(puedeAdmin === true, 'Admin puede ver vista "todos" en incidentes/bandeja');
                    return [4 /*yield*/, (0, vistas_1.puedeVerVista)("/plataforma/incidentes/bandeja", "vista-fantasma", 1)];
                case 5:
                    puedeInexistente = _a.sent();
                    assert(puedeInexistente === false, "Vista fantasma devuelve false");
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, pool.end()];
                case 7:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 8:
                    console.log("================================================================================");
                    console.log("RESUMEN: Total: ".concat(passed + failed, " | Aprobadas: ").concat(passed, " | Fallidas: ").concat(failed));
                    console.log("================================================================================");
                    if (failed > 0)
                        process.exit(1);
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error("Error fatal:", err);
    process.exit(1);
});
