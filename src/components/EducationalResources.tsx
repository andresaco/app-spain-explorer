import React from 'react';
import { BookOpen, Info, ExternalLink } from 'lucide-react';

export const EducationalResources: React.FC = () => {
  return (
    <section className="w-full max-w-4xl mb-12 px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <BookOpen size={24} />
        </div>
        <h3 className="text-3xl font-display font-bold text-slate-800">Recursos Educativos</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Info size={20} className="text-indigo-500" />
            ¿Por qué aprender Geografía?
          </h4>
          <p className="text-slate-600 leading-relaxed">
            Conocer la <strong>geografía de España</strong> ayuda a los niños de primaria a entender mejor su entorno, la diversidad cultural y la organización política de nuestro país. Este juego está diseñado siguiendo los objetivos curriculares para niños de <strong>8 a 10 años</strong>.
          </p>
          <ul className="mt-4 space-y-2 text-slate-500 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              Identificación de las 17 Comunidades Autónomas.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              Localización de las 50 provincias españolas.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              Reconocimiento de las ciudades autónomas de Ceuta y Melilla.
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ExternalLink size={20} className="text-indigo-500" />
            Enlaces de Interés
          </h4>
          <div className="space-y-4">
            <a 
              href="https://www.ign.es/resources/pue/index.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 group"
            >
              <span className="font-bold text-slate-700 group-hover:text-indigo-600 block">IGN para niños</span>
              <span className="text-xs text-slate-500">Recursos oficiales del Instituto Geográfico Nacional.</span>
            </a>
            <a 
              href="https://mapasinteractivos.didactalia.net/comunidad/mapasrecursoseducativos/recursos" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100 group"
            >
              <span className="font-bold text-slate-700 group-hover:text-indigo-600 block">Didactalia Mapas</span>
              <span className="text-xs text-slate-500">Más juegos y mapas interactivos de España.</span>
            </a>
          </div>
        </div>
      </div>

      <article className="mt-12 prose prose-slate max-w-none bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100">
        <h4 className="text-indigo-900 font-bold text-lg mb-4">Guía rápida de la Geografía Española</h4>
        <p className="text-indigo-800/80 text-sm leading-relaxed">
          España es un país situado en el suroeste de Europa, en la Península Ibérica. Se organiza en <strong>17 Comunidades Autónomas</strong> y <strong>2 Ciudades Autónomas</strong>. Cada comunidad está formada por una o varias <strong>provincias</strong>, sumando un total de 50. Aprender sus nombres y ubicaciones es fundamental para el estudio de las Ciencias Sociales en educación primaria.
        </p>
      </article>
    </section>
  );
};
