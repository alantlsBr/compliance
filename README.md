# Canal de Ética Fomentas

Projeto React + Express para registro de denúncias, envio de e-mail e gravação em SQL Server.

## O que esta versão faz

- Registra denúncias em banco de dados SQL Server.
- Gera protocolo único para cada denúncia.
- Salva evidências/anexos em pasta segura do servidor, registrando o caminho no banco.
- Envia e-mail para `alan.oliveira@fomentas.com.br`.
- Suporta Google reCAPTCHA v2 Checkbox para publicação em portal público.
- Remove dependências/referências externas de Base44/Manus.

## Banco de dados

Execute o script abaixo no SQL Server antes de iniciar a aplicação:

```text
/database/01_create_compliance_tables.sql
```

Tabelas criadas:

- `dbo.ComplianceDenuncia`
- `dbo.ComplianceAnexo`

## Configuração

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Preencha no `.env`:

- conexão SQL Server;
- SMTP Microsoft 365;
- chaves do Google reCAPTCHA.

## CAPTCHA

Para ambiente público, mantenha o CAPTCHA ativo.

Use Google reCAPTCHA v2, tipo **Checkbox**:

1. Acesse o Google reCAPTCHA Admin Console.
2. Crie uma chave do tipo `reCAPTCHA v2` > `Caixa de seleção "Não sou um robô"`.
3. Cadastre o domínio do portal. Para teste local, cadastre também `localhost`.
4. Copie a `site key` para `VITE_RECAPTCHA_SITE_KEY`.
5. Copie a `secret key` para `RECAPTCHA_SECRET_KEY`.

Se `RECAPTCHA_SECRET_KEY` não estiver configurada, o backend aceita envio sem reCAPTCHA. Isso deve ser usado apenas em desenvolvimento local.

## Instalação

```bash
npm install
npm run build
npm start
```

## Validação da API

```bash
GET /api/health
```

Retorna se a API conseguiu conectar no SQL Server.

## Observação sobre anexos

Os anexos não são gravados como varbinary no banco. A aplicação salva os arquivos em disco e grava os metadados/caminho na tabela `ComplianceAnexo`.

Essa abordagem evita crescimento desnecessário do banco, mas exige backup da pasta definida em `DATA_DIR`.
