// utils/constants.js
export const INSTITUICOES = {
  // Órgãos de análise
  MP: { id: 'mp', nome: 'Ministério Público', ordem: 1, tipo: 'analise' },
  MJ: { id: 'mj', nome: 'Ministério da Justiça', ordem: 2, tipo: 'encaminhamento' },
  CM: { id: 'cm', nome: 'Conselho de Ministros', ordem: 3, tipo: 'analise_relatorio' },
  PR: { id: 'pr', nome: 'Presidência da República', ordem: 4, tipo: 'promulgacao' },
  
  // Órgãos internos
  UCID: { id: 'ucid', nome: 'UCID', ordem: 5, tipo: 'gestao' },
  REPOGRAFIA: { id: 'repografia', nome: 'Repografia', ordem: 6, tipo: 'impressao' },
  
  // Órgãos externos finais
  REGISTRO_CIVIL: { id: 'registro_civil', nome: 'Registro Civil', ordem: 7, tipo: 'registro' },
};

export const STATUS_FLUXO = {
  AGUARDANDO: 'aguardando',
  EM_ANALISE: 'em_analise',
  APROVADO: 'aprovado',
  RECUSADO: 'recusado',
  REPASSADO: 'repassado',
  EXPIRADO: 'expirado',
  AGUARDANDO_IMPRESSAO: 'aguardando_impressao',
  IMPRESSO: 'impresso',
  REGISTRADO: 'registrado',
  CONCLUIDO: 'concluido'
};

export const TIPOS_DOCUMENTO = {
  RELATORIO_CM: 'relatorio_cm',
  RELATORIO_PROMULGACAO: 'relatorio_promulgacao',
  CERTIDAO_REGISTRO_CIVIL: 'certidao_registro_civil',
  CERTIDAO_REGISTRO_CRIMINAL: 'certidao_registro_criminal',
  PROCESSO_COMPLETO: 'processo_completo'
};

export const DIAS_EXPIRACAO = 30;