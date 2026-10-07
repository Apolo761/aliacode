# AliaCode

Landing page institucional em Astro, publicada na Cloudflare. Sem formulário, e-mail ou WhatsApp, conforme orientação da empresa.

## Infraestrutura

- Node.js 22.12 ou superior.
- Build: `npm ci && npm run build`. Saída estática em `dist/`.
- Builds, preview e testes de navegador devem rodar em serviços cloud. Não iniciar servidor ou build no Mac.
- GitHub Actions executa build, testes funcionais desktop/mobile e auditoria de acessibilidade, com screenshots nos artefatos.
- Após os testes de um push em `main`, o Actions aciona um build na Cloudflare por um deploy hook específico deste projeto, armazenado como secret. O painel Pages confirma a conclusão da publicação.
- Para testar uma publicação, executar `Cloud quality` com `base_url` preenchida.
- Logo original em `public/logo-aliacode.png`, enquadrado sem alterar a arte.
- Exemplos interativos são ilustrativos e não executam IA nem coletam dados.

## Conteúdo

Página principal em `src/pages/index.astro`; estilos em `src/styles/global.css`. Fonte Inter hospedada no próprio site, sob licença SIL Open Font License.

## Domínio

- Produção: https://aliacode.com
- `www.aliacode.com` redireciona para o domínio principal.
- Cloudflare Pages: projeto `aliacode`, conectado a este repositório.
- Registro na Hostinger; DNS na Cloudflare (`amanda.ns.cloudflare.com` e `kyle.ns.cloudflare.com`).
- E-mail continua na Hostinger. MX, SPF, DMARC, DKIM, autoconfig e autodiscover foram preservados; CNAMEs de e-mail estão sem proxy.
