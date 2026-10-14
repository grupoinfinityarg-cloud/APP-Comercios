import React, { useState } from 'react';
import { UserCheck, Plus, Search, Shield, Mail, Phone, Lock } from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { Employee } from '../../types';

interface EmployeesScreenProps {
  employees: Employee[];
}

export const EmployeesScreen: React.FC<EmployeesScreenProps> = ({ employees: initialEmployees }) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 13: Usuarios, Empleados y Permisos"
        description="Gestión del personal comercial, control de acceso por roles (RBAC: Administrador, Encargado, Cajero) y auditoría de accesos al sistema."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Usuarios & Empleados
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Administración del equipo comercial y permisos del sistema
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-3">Rol / Nivel</th>
                <th className="py-3 px-3">Sucursal Asignada</th>
                <th className="py-3 px-3">Teléfono</th>
                <th className="py-3 px-3">Último Acceso</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{emp.name}</div>
                    <div className="text-[11px] text-slate-400">{emp.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        emp.role === 'Administrador'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                          : emp.role === 'Encargado'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                    {emp.store}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{emp.phone}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{emp.lastAccess}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        emp.status === 'Activo'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Registrar Nuevo Colaborador
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Crea credenciales de acceso para el personal de tus comercios.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Aviso de demostración: Los usuarios se gestionarán mediante Firebase Auth / PostgreSQL en la siguiente fase.');
                setShowModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nombre y Apellido
                </label>
                <input
                  type="text"
                  defaultValue="Florencia Morales"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  defaultValue="florencia.morales@comercios360.demo"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rol asignado
                  </label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option>Cajero</option>
                    <option>Vendedor</option>
                    <option>Encargado</option>
                    <option>Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Sucursal
                  </label>
                  <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                    <option>Sucursal Central</option>
                    <option>Sucursal Norte</option>
                    <option>Depósito & Logística</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Guardar Usuario (Demo)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
