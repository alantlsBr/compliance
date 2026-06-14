# Auditoria Técnica - Canal de Ética Fomentas

## Resumo

O projeto original era majoritariamente front-end e não possuía persistência corporativa real. A versão anterior com JSON foi adequada para prova de conceito, mas não recomendada para produção.

Esta versão migra o registro das denúncias para SQL Server e adiciona validação CAPTCHA para reduzir spam e automações indevidas no portal público.

## Arquitetura atual

```text
React/Vite
   ↓ POST /api/complaints
Express/Node.js
   ↓ validação CAPTCHA Cloudflare Turnstile
SQL Server
   ↓
SMTP Microsoft 365
   ↓
alan.oliveira@fomentas.com.br
```

## Persistência

As denúncias são gravadas no SQL Server:

- `dbo.ComplianceDenuncia`: dados principais da denúncia.
- `dbo.ComplianceAnexo`: metadados dos anexos.

Os arquivos físicos são salvos na pasta configurada por `DATA_DIR`, por padrão:

```text
/data/evidencias/<protocolo>/
```

## Segurança implementada

- Remoção de gravação em JSON como base principal.
- Validação de payload no backend.
- CAPTCHA opcional por configuração, recomendado como obrigatório em produção.
- Limite de 20 MB para anexos.
- Sanitização de nomes de arquivos.
- Uso de transação SQL para denúncia + anexos.
- Dados pessoais não são persistidos quando a denúncia é anônima.
- Remoção de referências Base44/Manus sem dependência funcional.

## Pontos ainda recomendados antes de produção

- Publicar obrigatoriamente em HTTPS.
- Restringir acesso à pasta `DATA_DIR` fora da raiz pública do site.
- Criar rotina de backup do SQL Server e da pasta de evidências.
- Criar painel administrativo protegido por login Microsoft/AD.
- Criar trilha de auditoria para alterações de status da denúncia.
- Avaliar criptografia dos anexos em repouso.
- Configurar rate limit por IP no backend.
- Criar política formal de retenção LGPD.

## Decisão técnica

Para a Fomentas, SQL Server é mais adequado do que JSON porque permite:

- backup corporativo;
- consultas e relatórios;
- integração futura com Power BI;
- histórico de tratativas;
- governança e auditoria.
