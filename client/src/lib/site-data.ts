// Dados extraídos fielmente do site de referência Ética Fomentas

export const HARASSMENT_TYPES = [
  {
    title: "Assédio Moral",
    icon: "lP", // Será mapeado para o ícone correspondente do Lucide
    color: "bg-red-50 text-red-600 border-red-100",
    desc: "Condutas abusivas, repetitivas e prolongadas como humilhação, isolamento, gritos e sobrecarga.",
    examples: [
      "Gritar ou usar linguagem ofensiva com o colaborador",
      "Isolar a pessoa de reuniões e comunicações da equipe",
      "Atribuir tarefas humilhantes ou muito abaixo da qualificação",
      "Criticar publicamente de forma constante e desproporcional",
      "Sobrecarregar de trabalho como forma de punição"
    ]
  },
  {
    title: "Assédio Sexual",
    icon: "uP",
    color: "bg-pink-50 text-pink-600 border-pink-100",
    desc: "Constrangimento para obter vantagem sexual (art. 216-A do CP). Chantagem, toques, piadas explícitas.",
    examples: [
      "Condicionar promoção a favores sexuais",
      "Toques, abraços ou beijos não consentidos",
      "Piadas ou comentários de cunho sexual",
      "Envio de mensagens ou imagens de conteúdo sexual",
      "Olhares insistentes e constrangedores"
    ]
  },
  {
    title: "Assédio Discriminatório",
    icon: "Xw",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    desc: "Preconceito contra raça, gênero, religião, orientação sexual, deficiência, idade.",
    examples: [
      "Piadas sobre raça, etnia ou cor de pele",
      "Comentários depreciativos sobre orientação sexual",
      "Tratamento diferenciado por gênero ou religião",
      "Exclusão de atividades por deficiência",
      "Comomenteários pejorativos sobre idade"
    ]
  },
  {
    title: "Assédio Organizacional",
    icon: "$k",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    desc: "Práticas institucionais degradantes: metas impossíveis, vigilância excessiva, punições coletivas.",
    examples: [
      "Metas inatingíveis impostas com ameaças",
      "Monitoramento excessivo e invasivo",
      "Punições coletivas por falha individual",
      'Política de "portas abertas" mas com retaliação',
      "Pressão constante por resultados sem recursos"
    ]
  },
  {
    title: "Assédio Vertical",
    icon: "Vk",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    desc: "Relação hierárquica: descendente (chefe → subordinado) ou ascendente (subordinado → chefe).",
    examples: [
      "Chefe que humilha subordinado em público",
      "Líder que ameaça demissão constantemente",
      "Subordinados que boicotam decisões do gestor",
      "Uso de poder hierárquico para benefício pessoal",
      "Uso indevido de informações pessoais do subordinado"
    ]
  },
  {
    title: "Assédio Horizontal",
    icon: "Lk",
    color: "bg-teal-50 text-teal-600 border-teal-100",
    desc: "Entre pares: isolamento, fofocas maliciosas, sabotagem, ridicularização.",
    examples: [
      "Espalhar boatos sobre um colega",
      "Excluir deliberadamente de atividades da equipe",
      "Sabotar o trabalho do colega",
      "Ridicularizar em reuniões ou grupos",
      "Criar apelidos ofensivos ou pejorativos"
    ]
  },
  {
    title: "Assédio Digital",
    icon: "vP",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    desc: "Via e-mails, WhatsApp, Teams: exposição vexatória, mensagens ofensivas, exclusão digital.",
    examples: [
      "Mensagens ofensivas em grupos de trabalho",
      "Exposição vexatória em e-mails com cópia para todos",
      "Exclusão proposital de canais de comunicação",
      "Compartilhamento de informações pessoais sem consentimento",
      "Cobranças agressivas fora do horário de trabalho"
    ]
  },
  {
    title: "Assédio no Trabalho",
    icon: "_P",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    desc: "Intimidação sistemática para afastar ou excluir a vítima do convívio profissional.",
    examples: [
      "Intimidação constante para forçar pedido de demissão",
      "Tornar o ambiente de trabalho hostil propositalmente",
      "Ignorar sistematicamente as contribuições da pessoa",
      "Criar obstáculos para o desenvolvimento profissional",
      "Ameaças veladas e coerção"
    ]
  }
];

export const STEPPER_STEPS = [
  { label: "Seus Dados", desc: "Opcional – para anonimato" },
  { label: "Sobre o Fato", desc: "Detalhes do ocorrido" },
  { label: "Envolvidos", desc: "Agressor(es) e testemunhas" },
  { label: "Evidências", desc: "Upload de arquivos" },
  { label: "Finalização", desc: "Contato e confirmação" }
];

export const LOCATIONS = [
  "Escritório",
  "Home Office",
  "Reunião presencial",
  "Reunião virtual",
  "Grupo virtual (WhatsApp, Teams, etc.)",
  "Outro"
];

export const FAQS = [
  {
    q: "Minha denúncia será realmente anônima?",
    a: "Sim. Se você optar pelo anonimato, nenhum dado pessoal será registrado. Não salvamos IP, metadados de navegador ou qualquer informação que possa identificá-lo(a)."
  },
  {
    q: "Posso sofrer retaliação por denunciar?",
    a: "Não. A Empresa Fomentas proíbe qualquer forma de retaliação contra denunciantes de boa-fé. Tentativas de retaliação serão tratadas como falta grave."
  },
  {
    q: "Quanto tempo leva a apuração?",
    a: "A análise preliminar é realizada em até 15 dias úteis. Dependendo da complexidade, a apuração completa pode levar mais tempo, mas você será informado(a) sobre o andamento, se desejar."
  },
  {
    q: "Preciso ter provas para denunciar?",
    a: "Não. Evidências ajudam na apuração, mas não são obrigatórias. Seu relato detalhado já é suficiente para iniciar a investigação."
  },
  {
    q: "Quem terá acesso à minha denúncia?",
    a: "Apenas os membros do Conselho de Ética da Empresa Fomentas, que são obrigados a manter sigilo. Seus dados não serão compartilhados com gestores ou colegas."
  },
  {
    q: "Posso denunciar algo que aconteceu há muito tempo?",
    a: "Sim. Não há prazo para denunciar pelo canal interno. No entanto, para ações judiciais, existem prazos legais que devem ser observados."
  },
  {
    q: "Ex-colaboradores podem usar este canal?",
    a: "Sim. Ex-colaboradores podem denunciar situações ocorridas durante o período em que mantiveram vínculo com a empresa."
  }
];

export const EXTERNAL_CHANNELS = [
  {
    name: "Ministério Público do Trabalho (MPT)",
    desc: "Denúncias trabalhistas e fiscalização",
    url: "https://www.prt2.mpt.mp.br"
  },
  {
    name: "Justiça do Trabalho",
    desc: "Ações judiciais e reclamações trabalhistas",
    url: "https://www.tst.jus.br"
  },
  {
    name: "Sindicato da Categoria",
    desc: "Apoio e representação sindical",
    url: "#"
  },
  {
    name: "Disque 100 – Direitos Humanos",
    desc: "Canal nacional de denâncias",
    url: "https://www.gov.br/mdh"
  }
];

export const FLOW_STEPS = [
  {
    title: "Recebimento",
    desc: "Sua denúncia é recebida pelo Conselho de Ética com sigilo garantido.",
    detail: "Protocolo gerado automaticamente"
  },
  {
    title: "Análise Preliminar",
    desc: "Abertura de apuração com análise dos fatos relatados.",
    detail: "Prazo de até 15 dias úteis"
  },
  {
    title: "Medidas Cabíveis",
    desc: "Advertência, suspensão, demissão por justa causa, ou encaminhamento ao MPT.",
    detail: "Ação proporcional à gravidade"
  }
];
