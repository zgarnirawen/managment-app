"use strict";
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
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function seedRoleBasedData() {
    return __awaiter(this, void 0, void 0, function () {
        var departments, admin, manager, employee, intern, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Starting role-based data seeding...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 10]);
                    // First, create departments
                    console.log('📁 Creating departments...');
                    return [4 /*yield*/, Promise.all([
                            prisma.department.upsert({
                                where: { name: 'Engineering' },
                                update: {},
                                create: {
                                    name: 'Engineering',
                                    description: 'Software development and technical infrastructure'
                                }
                            }),
                            prisma.department.upsert({
                                where: { name: 'Human Resources' },
                                update: {},
                                create: {
                                    name: 'Human Resources',
                                    description: 'Employee relations and organizational development'
                                }
                            }),
                            prisma.department.upsert({
                                where: { name: 'Marketing' },
                                update: {},
                                create: {
                                    name: 'Marketing',
                                    description: 'Brand management and customer acquisition'
                                }
                            }),
                            prisma.department.upsert({
                                where: { name: 'Operations' },
                                update: {},
                                create: {
                                    name: 'Operations',
                                    description: 'Business operations and process management'
                                }
                            })
                        ])];
                case 2:
                    departments = _a.sent();
                    console.log("\u2705 Created ".concat(departments.length, " departments"));
                    // Create test employees for each role
                    console.log('👥 Creating role-based test employees...');
                    return [4 /*yield*/, prisma.employee.upsert({
                            where: { email: 'admin@company.com' },
                            update: {},
                            create: {
                                name: 'Sarah Chen',
                                email: 'admin@company.com',
                                clerkId: 'admin_clerk_id_001',
                                role: 'Admin',
                                position: 'Chief Technology Officer',
                                departmentId: departments[0].id, // Engineering
                                phone: '+1-555-0101',
                                address: '123 Executive Ave, Tech City, TC 12345',
                                hireDate: new Date('2020-01-15'),
                                emergencyContactName: 'Michael Chen',
                                emergencyContactPhone: '+1-555-0102',
                                emergencyContactRelationship: 'Spouse'
                            }
                        })];
                case 3:
                    admin = _a.sent();
                    return [4 /*yield*/, prisma.employee.upsert({
                            where: { email: 'manager@company.com' },
                            update: {},
                            create: {
                                name: 'Marcus Rodriguez',
                                email: 'manager@company.com',
                                clerkId: 'manager_clerk_id_002',
                                role: 'Manager',
                                position: 'Engineering Team Lead',
                                departmentId: departments[0].id, // Engineering
                                managerId: admin.id, // Reports to admin
                                phone: '+1-555-0201',
                                address: '456 Manager Blvd, Tech City, TC 12346',
                                hireDate: new Date('2021-03-10'),
                                emergencyContactName: 'Sofia Rodriguez',
                                emergencyContactPhone: '+1-555-0202',
                                emergencyContactRelationship: 'Spouse'
                            }
                        })];
                case 4:
                    manager = _a.sent();
                    return [4 /*yield*/, prisma.employee.upsert({
                            where: { email: 'employee@company.com' },
                            update: {},
                            create: {
                                name: 'Alex Thompson',
                                email: 'employee@company.com',
                                clerkId: 'employee_clerk_id_003',
                                role: 'Employee',
                                position: 'Software Developer',
                                departmentId: departments[0].id, // Engineering
                                managerId: manager.id, // Reports to manager
                                phone: '+1-555-0301',
                                address: '789 Developer St, Tech City, TC 12347',
                                hireDate: new Date('2022-06-20'),
                                emergencyContactName: 'Jamie Thompson',
                                emergencyContactPhone: '+1-555-0302',
                                emergencyContactRelationship: 'Sibling'
                            }
                        })];
                case 5:
                    employee = _a.sent();
                    return [4 /*yield*/, prisma.employee.upsert({
                            where: { email: 'intern@company.com' },
                            update: {},
                            create: {
                                name: 'Jamie Kim',
                                email: 'intern@company.com',
                                clerkId: 'intern_clerk_id_004',
                                role: 'Intern',
                                position: 'Software Development Intern',
                                departmentId: departments[0].id, // Engineering
                                managerId: employee.id, // Reports to regular employee
                                phone: '+1-555-0401',
                                address: '321 Student Ave, Tech City, TC 12348',
                                hireDate: new Date('2024-01-15'),
                                emergencyContactName: 'Dr. Kim Lee',
                                emergencyContactPhone: '+1-555-0402',
                                emergencyContactRelationship: 'Parent'
                            }
                        })];
                case 6:
                    intern = _a.sent();
                    console.log('✅ Created test employees:');
                    console.log("   \uD83D\uDD34 Admin: ".concat(admin.name, " (").concat(admin.email, ")"));
                    console.log("   \uD83D\uDFE1 Manager: ".concat(manager.name, " (").concat(manager.email, ")"));
                    console.log("   \uD83D\uDFE2 Employee: ".concat(employee.name, " (").concat(employee.email, ")"));
                    console.log("   \uD83D\uDD35 Intern: ".concat(intern.name, " (").concat(intern.email, ")"));
                    console.log('🎉 Role-based seeding completed successfully!');
                    console.log('');
                    console.log('📝 Test Accounts Created:');
                    console.log('----------------------------------------');
                    console.log('🔴 ADMIN ACCESS:');
                    console.log('   Email: admin@company.com');
                    console.log('   Role: Admin');
                    console.log('   Access: Full system access, user management, audit logs');
                    console.log('');
                    console.log('🟡 MANAGER ACCESS:');
                    console.log('   Email: manager@company.com');
                    console.log('   Role: Manager');
                    console.log('   Access: Team management, reports, sprint planning');
                    console.log('');
                    console.log('🟢 EMPLOYEE ACCESS:');
                    console.log('   Email: employee@company.com');
                    console.log('   Role: Employee');
                    console.log('   Access: Tasks, projects, timesheets, collaboration');
                    console.log('');
                    console.log('🔵 INTERN ACCESS:');
                    console.log('   Email: intern@company.com');
                    console.log('   Role: Intern');
                    console.log('   Access: Intern portal, basic tasks, learning resources');
                    console.log('');
                    console.log('🚀 You can now test role-based access control!');
                    return [3 /*break*/, 10];
                case 7:
                    error_1 = _a.sent();
                    console.error('❌ Error during seeding:', error_1);
                    throw error_1;
                case 8: return [4 /*yield*/, prisma.$disconnect()];
                case 9:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// Run the seeding function
seedRoleBasedData()
    .catch(function (error) {
    console.error(error);
    process.exit(1);
});
