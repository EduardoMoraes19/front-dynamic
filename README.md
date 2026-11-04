# Front Dinâmico por Domínio — POC para Cartórios

> Um único frontend que se transforma na landing page de cada cartório de acordo com o **domínio** pelo qual é acessado.

O sistema lê o domínio da requisição (`Host`), identifica qual cartório (o _tenant_) está sendo acessado e monta a página a partir de um **JSON de configuração**. Esse JSON define a identidade visual (cores, fontes, arredondamento, monograma), os textos (nome, slogan, SEO) e quais seções aparecem, em que ordem e com qual layout.

Hoje o JSON fica em arquivos locais. A arquitetura já está preparada para que ele venha de uma **API**.

---

## Sumário

- [Objetivo e caso de uso](#objetivo-e-caso-de-uso)
- [Stack](#stack)
- [Rodando localmente](#rodando-localmente)
- [Arquitetura](#arquitetura)
- [Estrutura de pastas](#estrutura-de-pastas)
- [O contrato do JSON](#o-contrato-do-json)
- [Seções disponíveis](#seções-disponíveis)
- [Sistema de tema](#sistema-de-tema)
- [Os três cartórios de exemplo](#os-três-cartórios-de-exemplo)
- [Como estender](#como-estender)
- [Migrando para uma API](#migrando-para-uma-api)
- [Decisões técnicas](#decisões-técnicas)
- [Limitações conhecidas e próximos passos](#limitações-conhecidas-e-próximos-passos)
- [Licença](#licença)

---

## Objetivo e caso de uso

Cada cartório (cliente) tem o seu domínio, por exemplo `cartoriocentro.com.br`. Todos esses domínios apontam para **o mesmo deploy**. Quando uma requisição chega:

1. o frontend descobre qual cartório corresponde ao domínio;
2. busca a configuração desse cartório (hoje um JSON local, futuramente uma API);
3. renderiza uma landing page própria, com cores, textos, seções e layout diferentes, **sem nenhum código específico por cliente**.

Para adicionar um cartório novo, basta criar uma configuração. Não é preciso alterar código nem fazer outro deploy (quando os dados vierem da API).

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | **Next.js 16** (App Router, Cache Components, `proxy.ts`) |
| UI | **React 19**, **Tailwind CSS v4** |
| Validação | **zod 4** |
| Ícones | **lucide-react** |
| Fontes | `next/font/google`: Fraunces (serif), Source Sans 3 (sans), Space Grotesk (grotesk), IBM Plex Mono (mono) |
| Linguagem | TypeScript |

## Rodando localmente

Pré-requisito: Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

| URL | O que mostra |
| --- | --- |
| http://localhost:3000 | Página inicial da POC, com a lista de todos os cartórios e os links para cada um |
| http://centro.localhost:3000 | 1º Tabelionato de Notas e Protesto de Vila Aurora |
| http://sul.localhost:3000 | Registro Civil das Pessoas Naturais — Distrito Sul |
| http://norte.localhost:3000 | Ofício de Registro de Imóveis da Zona Norte |
| http://cartorio-centro.localhost:3000 | O mesmo cartório, resolvido pela convenção `<slug>.localhost` |
| http://localhost:3000/?tenant=cartorio-sul | Força um cartório pela query string (útil em URLs de preview) |
| http://qualquer-coisa.localhost:3000 | Página "Cartório não encontrado" |

> Chrome, Edge, Firefox e Safari resolvem qualquer `*.localhost` para `127.0.0.1`. **Não é preciso editar o `/etc/hosts`.**

Outros comandos:

```bash
npm run build   # build de produção (pré-renderiza a página de cada cartório)
npm run start   # serve o build
npm run lint    # ESLint
```

## Page Builder (Puck) — porta 3001

O diretório `builder/` é um **segundo app Next.js** que simula o "hub": um editor visual drag-and-drop feito com o [Puck](https://github.com/puckeditor/puck) (MIT). Ele roda em paralelo ao renderer:

```bash
npm run dev            # renderer  → http://localhost:3000  (sites dos cartórios)
npm run dev:builder    # builder   → http://localhost:3001  (hub / editor)
```

| URL | O que faz |
| --- | --- |
| http://localhost:3001 | Lista de sites + formulário **"Novo cartório"** (cria o site a partir de um template) |
| http://localhost:3001/edit/cartorio-centro | Editor visual do site |

### O que dá para fazer no editor

- **Arrastar blocos** (Hero, Aviso, Números, Serviços, Checklist, FAQ, Horários, Localização, Contato) para a página, **reordenar**, **duplicar** e **remover**.
- **Clicar num bloco** e editar seus campos no painel lateral (textos, layout/variante, listas, CTAs, ícones, dias da semana...).
- Editar a **página** (nada selecionado): nome, slogan, tipo de serventia, **tema** (color pickers, fontes, arredondamento, monograma), SEO e dados legais.
- **Preview responsivo** (celular / tablet / desktop) e desfazer/refazer.
- **Publish** → valida, grava o JSON e o site atualiza no domínio do cartório na hora.

### Como funciona

```
 Builder :3001 (Puck)                                   Renderer :3000
 ┌───────────────────────────────┐                     ┌──────────────────────────┐
 │ canvas renderiza OS MESMOS    │                     │                          │
 │ componentes de src/components │                     │ centro.localhost:3000    │
 │ (WYSIWYG real)                │                     │                          │
 │                               │  1. PUT /api/sites  │                          │
 │ [Publish] ────────────────────┼──▶ Puck Data → JSON │                          │
 │                               │    zod (estrito)    │                          │
 │                               │    grava data/*.json│                          │
 │                               │  2. POST /api/revalidate (webhook) ──────────▶ │
 │                               │                     │ revalidateTag(tenant:x)  │
 └───────────────────────────────┘                     └──────────────────────────┘
```

- **Mesmos componentes e mesmo schema**: o builder importa `src/components/sections/*` e `src/lib/tenant/schema.ts` (alias `@/` aponta para `../src`). O que aparece no canvas é exatamente o que será publicado; não há duas implementações.
- **Tradução de formatos** (`builder/lib/mapping.ts`): JSON do tenant ⇄ `Data` do Puck. O `id` da seção vira `anchor` (o Puck reserva `props.id`) e listas de texto viram listas de objetos `{ text }`.
- **Validação**: no canvas, um bloco com campo obrigatório vazio mostra um aviso no lugar da seção. Ao publicar, o servidor valida com `TenantSchemaStrict` e devolve os erros legíveis no toast.
- **Webhook**: `src/app/api/revalidate/route.ts` (protegido por `x-revalidate-secret`, variável `REVALIDATE_SECRET`, padrão `dev-secret` em dev) invalida o cache do site publicado.
- **"Banco"**: nesta POC o builder grava direto em `data/tenants/*.json`. No hub real, isso vira o banco (com rascunho/publicado e histórico) e o renderer lê pela API.

Arquivos principais:

```
builder/
  next.config.ts            # turbopack.root = raiz do repo (compartilha src/ e node_modules)
  app/page.tsx              # lista de sites + "Novo cartório"
  app/edit/[slug]/Editor.tsx# <Puck> + publish + toast
  app/api/sites/route.ts    # POST: cria site a partir de template
  app/api/sites/[slug]/route.ts # PUT: publica (valida, grava, webhook)
  lib/puck-config.tsx       # blocos, campos e root (tema/cabeçalho/rodapé)
  lib/fields.tsx            # campos customizados: color picker, dias da semana
  lib/mapping.ts            # JSON do tenant ⇄ Data do Puck
  lib/store.ts              # leitura/gravação dos JSONs + webhook
```

## Arquitetura

```
                    ┌────────────────────────────────────────────────────┐
 Requisição         │ src/proxy.ts                                       │
 Host: centro.  ───▶│  resolveTenant(host, ?tenant)                      │
 localhost:3000     │   1. ?tenant=slug           (override)             │
                    │   2. data/domains.json      (domínio → slug)       │
                    │   3. <slug>.localhost       (convenção local)      │
                    │   4. localhost puro         → página inicial       │
                    │  NextResponse.rewrite("/sites/<slug>")             │
                    └───────────────────────┬────────────────────────────┘
                                            │ (a URL do navegador não muda)
                    ┌───────────────────────▼────────────────────────────┐
                    │ src/app/sites/[slug]/page.tsx                      │
                    │  getTenant(slug)  ── "use cache" + cacheTag        │
                    │     └─ TenantSource.getBySlug → zod.parse          │
                    │  generateMetadata / generateViewport (SEO, cor)    │
                    └───────────────────────┬────────────────────────────┘
                                            │
              ┌─────────────────────────────┼──────────────────────────────┐
              ▼                             ▼                              ▼
       <ThemeScope>                  <SiteHeader>                  <SectionRenderer>
  :root{--t-primary:…}         selo + menu gerado das       sections[].type → registry
  aplicado no HTML do          seções com navLabel          → <Hero/>, <Services/>, …
  servidor (sem flash)
```

### Fluxo em detalhes

1. **Resolução do cartório (`src/lib/tenant/resolve.ts`)**: uma função pura que recebe o `Host` e o `?tenant` e devolve `{ kind: "tenant", slug }` ou `{ kind: "root" }`. Remove a porta e o `www.`.
2. **Rewrite (`src/proxy.ts`)**: no Next 16, o antigo `middleware.ts` passou a se chamar `proxy.ts`. Ele reescreve `/` para `/sites/<slug>` sem alterar a URL do navegador. Os caminhos `/sites/*` passam direto, pois o favicon gerado vive em `/sites/<slug>/icon`.
3. **Carregamento (`src/lib/tenant/index.ts`)**: `getTenant(slug)` usa `"use cache"`, `cacheLife("hours")` e `cacheTag("tenant:<slug>")`.
4. **Validação (`src/lib/tenant/schema.ts`)**: o JSON é validado com zod. Se um campo obrigatório estiver errado, o erro é legível. Se uma seção for inválida ou de tipo desconhecido, ela é **descartada com um aviso** e o restante da página continua funcionando.
5. **Renderização**: a página aplica o tema, o cabeçalho, as seções na ordem do JSON e o rodapé com os dados legais (CNS, oficial titular, CNPJ).
6. **Pré-renderização**: `generateStaticParams` lista os cartórios conhecidos e o build gera HTML estático para cada um. Um slug novo é renderizado sob demanda.

## Estrutura de pastas

```
data/
  domains.json                    # mapa domínio → slug
  tenants/
    cartorio-centro.json
    cartorio-sul.json
    tabelionato-norte.json
src/
  proxy.ts                        # resolve o host e faz o rewrite para /sites/<slug>
  app/
    layout.tsx                    # carrega as 4 famílias de fonte como CSS vars
    globals.css                   # tokens Tailwind ligados às variáveis --t-*
    page.tsx                      # página inicial da POC (lista de cartórios)
    not-found.tsx                 # "Cartório não encontrado"
    sites/[slug]/
      page.tsx                    # landing page do cartório
      icon.tsx                    # favicon gerado (monograma nas cores da marca)
  lib/tenant/
    schema.ts                     # contrato zod + tipos
    source.ts                     # interface TenantSource
    local-source.ts               # implementação que lê data/tenants/*.json
    index.ts                      # getTenant/listTenants com cache
    resolve.ts                    # host → slug
  components/
    theme/ThemeScope.tsx          # tema → variáveis CSS
    brand/Seal.tsx                # selo circular SVG gerado a partir do nome
    brand/icons.ts                # chave do JSON → ícone lucide
    layout/SiteHeader.tsx         # cabeçalho com menu dinâmico
    layout/SiteFooter.tsx         # dados legais
    layout/CurrentHost.tsx        # helpers client-side para o host atual
    sections/
      registry.tsx                # type → componente (com checagem de tipos)
      SectionRenderer.tsx
      shared.tsx                  # SectionShell, SectionHeading, ButtonLink
      Hero.tsx  Notice.tsx  Stats.tsx  Services.tsx  Checklist.tsx
      OpeningHours.tsx  OpenNowBadge.tsx  Location.tsx  Faq.tsx  Contact.tsx
```

## O contrato do JSON

Exemplo resumido (o arquivo completo está em `data/tenants/cartorio-centro.json`):

```jsonc
{
  "slug": "cartorio-centro",
  "name": "1º Tabelionato de Notas e Protesto de Vila Aurora",
  "shortName": "1º Tabelionato de Vila Aurora",          // opcional, usado no cabeçalho
  "slogan": "Segurança jurídica com tradição desde 1952.",
  "kind": "notas",            // notas | registro-civil | imoveis | protesto | titulos-documentos
  "theme": {
    "primary": "#13294B",     // cor principal da marca
    "onPrimary": "#F7F4EC",   // texto sobre a cor primária
    "accent": "#B8892B",      // destaques (ícones, detalhes)
    "background": "#F7F4EC",
    "surface": "#FFFDF8",     // cards e seções alternadas
    "text": "#1C1B19",
    "muted": "#5E5A52",
    "headingFont": "serif",   // serif | sans | grotesk | mono
    "bodyFont": "sans",
    "radius": "sm",           // none | sm | md | lg | xl
    "monogram": "1ºT"         // opcional; sem ele, é gerado a partir do nome
  },
  "seo": { "title": "…", "description": "…" },
  "sections": [
    { "type": "hero", "variant": "split", "data": { "cta": { "label": "Agendar", "href": "#contato" } } },
    { "type": "services", "id": "servicos", "navLabel": "Serviços", "variant": "grid", "data": { "items": [ … ] } }
  ],
  "legal": {
    "cns": "12.345-6",
    "officer": "Dra. Helena Bragança Ferraz",
    "officerTitle": "Tabeliã Titular",
    "cnpj": "12.345.678/0001-90"
  }
}
```

Campos comuns a qualquer seção:

| Campo | Descrição |
| --- | --- |
| `type` | Tipo da seção (veja a tabela abaixo) |
| `variant` | Variação de layout, quando a seção tiver |
| `id` | Âncora HTML (`#servicos`) |
| `navLabel` | Se presente junto com `id`, a seção aparece no menu do cabeçalho |
| `data` | Conteúdo específico da seção |

## Seções disponíveis

| `type` | Variantes | O que faz |
| --- | --- | --- |
| `hero` | `split` · `centered` · `monumental` | Abertura com título, slogan, CTAs e destaques. `split` mostra o selo do cartório ao lado; `centered` tem um gradiente suave; `monumental` usa tipografia grande com o selo como marca d'água. Se `title` ou `subtitle` forem omitidos, usa o nome e o slogan. |
| `notice` | `tone: info · warning` | Faixa de aviso no topo (ex.: "Casamento comunitário — inscrições abertas"). |
| `stats` | — | Números da serventia ("72 anos", "+180 mil atos"). |
| `services` | `grid` · `list` | Serviços com ícone, descrição e tag opcional ("Online", "Gratuito"). |
| `checklist` | — | **"O que levar"**: abas por serviço com checklist interativo e barra de progresso. Evita que a pessoa perca a viagem. |
| `openingHours` | — | Tabela de horários com o badge **"Aberto agora / Fechado"** calculado no fuso do cartório (`timezone`, padrão `America/Sao_Paulo`). |
| `location` | — | Endereço, ponto de referência, mapa embutido do OpenStreetMap e link "Como chegar". |
| `faq` | — | Perguntas frequentes em acordeão (`<details>` nativo, sem JS). |
| `contact` | — | Cartões de WhatsApp, telefone e e-mail; só os canais informados aparecem. |

Ícones aceitos em `services.items[].icon`: `file-text`, `scroll`, `stamp`, `pen`, `house`, `baby`, `heart`, `gavel`, `landmark`, `signature`, `key`, `scale`, `users`, `badge`, `shield`, `building`, `file-check`, `calendar`.

### Elementos sempre presentes

- **Cabeçalho fixo**: selo do cartório, nome curto, tipo de serventia e um menu montado a partir das seções com `navLabel`.
- **Rodapé legal**: nome completo, oficial titular, CNS, CNPJ e a menção à Lei 8.935/94.
- **Selo gerado**: SVG com o nome do cartório em texto circular e o monograma no centro, inspirado em carimbos de fé pública. Dispensa logo.
- **Favicon gerado**: PNG com o monograma nas cores do cartório (`app/sites/[slug]/icon.tsx`).
- **SEO**: `title`, `description`, Open Graph e `theme-color` próprios de cada cartório.

## Sistema de tema

Os componentes **nunca sabem qual cartório estão renderizando**. Eles usam apenas classes semânticas do Tailwind:

```tsx
<a className="bg-primary text-on-primary rounded-brand font-heading">…</a>
```

Essas classes são definidas em `globals.css` e apontam para variáveis CSS:

```css
@theme inline {
  --color-primary: var(--t-primary);
  --color-on-primary: var(--t-on-primary);
  --radius-brand: var(--t-radius);
  --font-heading: var(--t-font-heading);
  /* … */
}
```

O `ThemeScope` converte o `theme` do JSON em `:root{--t-primary:#13294B; …}` e injeta esse bloco no HTML **renderizado no servidor**. Assim a página já chega com as cores certas, sem flash de tema. As cores passam por uma regex de hex (`#RRGGBB`) antes de chegar ao CSS, o que evita injeção.

As quatro famílias de fonte são carregadas uma única vez no layout raiz. Cada cartório apenas escolhe quais usar no título e no corpo.

## Os três cartórios de exemplo

| | Centro | Sul | Norte |
| --- | --- | --- | --- |
| Tipo | Tabelionato de Notas | Registro Civil | Registro de Imóveis |
| Estilo | Clássico, institucional | Moderno, acolhedor | Escuro, premium |
| Cores | Azul-marinho + dourado | Verde-petróleo + âmbar | Preto + champanhe |
| Fontes | Fraunces / Source Sans | Space Grotesk | Fraunces / IBM Plex Mono |
| Arredondamento | `sm` | `xl` | `none` |
| Hero | `split` | `centered` | `monumental` |
| Serviços | `grid` | `list` | `grid` |
| Ordem das seções | hero → stats → serviços → checklist → horários → mapa → FAQ → contato | **aviso** → hero → serviços → contato → horários → mapa | hero → **checklist** → serviços → stats → FAQ → contato → mapa → horários |
| Particularidades | — | Tem uma seção `testimonials` (não suportada) **de propósito**, para demonstrar a resiliência | Checklist vem logo após o hero |

## Como estender

### Adicionar um cartório

1. Copie um arquivo de `data/tenants/` para `data/tenants/meu-cartorio.json` e ajuste o conteúdo.
2. Pronto: `http://meu-cartorio.localhost:3000` já funciona.
3. (Opcional) Para domínios personalizados, adicione em `data/domains.json`:
   ```json
   { "meucartorio.com.br": "meu-cartorio" }
   ```

### Adicionar um tipo de seção

1. **Schema**: em `src/lib/tenant/schema.ts`, crie um `z.object({ ...base, type: z.literal("minhaSecao"), data: … })` e inclua-o em `SectionSchema`.
2. **Componente**: crie `src/components/sections/MinhaSecao.tsx`, recebendo `SectionProps<SectionOf<"minhaSecao">>`.
3. **Registro**: adicione a entrada em `src/components/sections/registry.tsx`.

O TypeScript **acusa erro** se um tipo declarado no schema não estiver no registry, então não dá para esquecer o passo 3.

### Adicionar uma variante

Adicione o valor ao `z.enum` do `variant` da seção e trate o caso no componente.

## Migrando para uma API

A fonte de dados está isolada atrás de uma interface:

```ts
// src/lib/tenant/source.ts
export interface TenantSource {
  getBySlug(slug: string): Promise<Tenant | null>;
  listSlugs(): Promise<string[]>;
}
```

Para trocar o JSON local por uma API:

```ts
// src/lib/tenant/api-source.ts
export class ApiTenantSource implements TenantSource {
  constructor(private baseUrl: string) {}
  async getBySlug(slug: string) {
    const res = await fetch(`${this.baseUrl}/tenants/${slug}`);
    if (res.status === 404) return null;
    return TenantSchema.parse(await res.json());
  }
  async listSlugs() {
    const res = await fetch(`${this.baseUrl}/tenants`);
    return (await res.json()).map((t: { slug: string }) => t.slug);
  }
}

// src/lib/tenant/index.ts
export const tenantSource: TenantSource = new ApiTenantSource(process.env.TENANT_API_URL!);
```

- **Cache e invalidação**: `getTenant` já usa `cacheTag("tenant:<slug>")`. Quando o cliente editar a página num painel, basta chamar `revalidateTag("tenant:<slug>")` (por exemplo, num webhook) e a página é atualizada sem novo deploy.
- **Domínios**: o `proxy.ts` hoje lê `data/domains.json`. Com a API, o ideal é consultar um armazenamento de baixa latência (KV, Global Config, Redis) que mapeie domínio → slug.
- **Contrato**: o schema zod continua sendo a fonte da verdade e protege o frontend de respostas malformadas.

## Decisões técnicas

| Decisão | Motivo |
| --- | --- |
| **SSR/SSG em vez de SPA** | O tema e o conteúdo chegam prontos no HTML: sem flash de cores, com bom SEO e bom LCP. |
| **Rewrite no `proxy.ts`** | A URL do usuário continua limpa (`/`), enquanto internamente cada cartório tem a sua rota pré-renderizável (`/sites/<slug>`). |
| **Variáveis CSS para o tema** | Não é preciso gerar CSS por cartório; o mesmo bundle serve todos. |
| **Validação por seção** | Uma API que evolui (seção nova, campo renomeado) não derruba a página inteira; só a seção afetada some. |
| **Registry tipado** | Mapeamento explícito `type → componente`, com garantia em tempo de compilação. |
| **Selo e favicon gerados** | Um cartório novo fica apresentável sem precisar enviar logo. |
| **"Aberto agora" no cliente** | Depende do horário atual; calcular no servidor causaria divergência de hidratação e quebraria o cache estático. |
| **`*.localhost` para desenvolvimento** | Simula múltiplos domínios sem configuração no sistema operacional. |

## Limitações conhecidas e próximos passos

**Limitações**

- No **primeiro** acesso a um slug inexistente, a resposta sai com status `200`: com Partial Prerendering, o shell é enviado por streaming antes do `notFound()`. O conteúdo exibido já é "Cartório não encontrado" e os acessos seguintes retornam `404`. Em produção, o `proxy.ts` pode validar se o domínio existe antes do rewrite.
- O `?tenant=` não persiste entre navegações (aqui só há âncoras na mesma página, então não faz diferença).
- Não há logo enviado pelo cliente; usa-se o selo gerado.

**Próximos passos sugeridos**

- [ ] `ApiTenantSource` + webhook de `revalidateTag`
- [ ] Mapa de domínios em KV/Global Config e validação no `proxy.ts` (404 real)
- [ ] Suporte a logo/imagens (upload em Blob storage)
- [ ] Novas seções: depoimentos, equipe, tabela de emolumentos, consulta de protocolo, agendamento
- [ ] Painel de edição com preview ao vivo do JSON
- [ ] Verificação automática de contraste (WCAG) das cores do tema
- [ ] Testes: unitários para `resolveTenant` e o schema; e2e (Playwright) por cartório

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](./LICENSE).
