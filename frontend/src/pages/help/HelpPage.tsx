
import { useHelpDocs } from '../../hooks/useHelpDocs';

// Página de Help (/help): navegação por tópicos e leitura simplificada.
export function HelpPage(): React.ReactElement {
  const topics = useHelpDocs();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Help & Documentação</h1>
      <p className="text-sm text-gray-600 mb-4">Acesse os tópicos de documentação do sistema.</p>
      <ul className="list-disc pl-6">
        {topics.map((t) => (
          <li key={t.id} className="mb-2">
            <span className="font-medium mr-2">{t.title}</span>
            <span className="text-gray-500">{t.path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HelpPage;