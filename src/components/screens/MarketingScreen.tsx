import React, { useState } from 'react';
import {
  Megaphone,
  Share2,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Instagram,
  MessageCircle,
  Plus,
} from 'lucide-react';
import { DemoNotice } from '../DemoNotice';
import { SocialPromoPost } from '../../types';
import { DEMO_SOCIAL_POSTS } from '../../data/demoData';

export const MarketingScreen: React.FC = () => {
  const [posts, setPosts] = useState<SocialPromoPost[]>(DEMO_SOCIAL_POSTS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <DemoNotice
        title="Módulo 15: Publicidad y Difusión para Redes Sociales"
        description="Generador visual de promociones, textos comerciales para WhatsApp e imágenes promocionales para Instagram y Facebook de tu comercio."
      />

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Publicidad para Redes Sociales
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Diseña campañas de difusión y copia textos promocionales listos para compartir
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Anuncio de Difusión</span>
        </button>
      </div>

      {/* Social Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            {/* Visual Card Banner Preview */}
            <div className={`p-6 bg-gradient-to-br ${post.bannerColor} text-white relative min-h-[160px] flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {post.platform}
                </span>
                <span className="text-[11px] font-bold text-white/90">COMERCIOS 360</span>
              </div>
              <div className="mt-4">
                <h3 className="font-extrabold text-lg leading-tight drop-shadow-xs">
                  {post.title}
                </h3>
                <p className="text-xs text-white/90 mt-1 drop-shadow-xs font-medium">
                  {post.tagline}
                </p>
              </div>
            </div>

            {/* Content & Copy Section */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Texto sugerido para publicación:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed font-sans">
                  {post.suggestedText}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.map((ht, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md"
                    >
                      {ht}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyText(post.id, `${post.suggestedText}\n\n${post.hashtags.join(' ')}`)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    copiedId === post.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {copiedId === post.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Copiado al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Texto & Hashtags</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal create ad */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Crear Nuevo Anuncio Comercial
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Genera copies listos para enviar a tus listas de difusión de WhatsApp o publicar en Instagram.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Aviso de demostración: Anuncio generado.');
                setShowCreateModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Título de la campaña
                </label>
                <input
                  type="text"
                  defaultValue="¡Fin de semana de ofertas especiales en Lácteos!"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Red Social / Canal
                </label>
                <select className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                  <option>WhatsApp</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>TikTok</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Generar Anuncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
