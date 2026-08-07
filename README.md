# Pass Scout — Test Site (45 jogadores)

Site estático idêntico ao frontend do [xpv-xp_site](https://github.com/waltfilipe/xpv-xp_site), porém com apenas **45 meio-campistas** selecionados e todos os dados (métricas, perfis, mapas) embutidos localmente — sem backend Python em runtime.

## Jogadores incluídos

| Faixa | Grupo | Qtd |
|-------|-------|-----|
| U23 | Breakout Promises | 15 |
| 24–30 | Blue Collar Prospects | 15 |
| >30 | Standout Experience | 15 |

Rankings e métricas preservados do pool completo de meio-campistas europeus (~500+), idênticos ao site principal.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abre em http://localhost:3000

## Build / deploy

```bash
npm run build
npm start
```

Compatível com Vercel (deploy apenas do frontend + pasta `data/`).

## Estrutura

```
app/           # Páginas Next.js (profile, compare, maps, players)
app/api/       # Rotas API que servem JSON estático
components/    # Componentes UI (copiados do xpv-xp_site)
data/          # Dados estáticos extraídos (perfis, mapas, métricas)
lib/           # Cliente API + store server-side
```

## Regenerar dados

Os dados foram extraídos do backend do `xpv-xp_site` com:

```bash
cd ../xpv-xp_site/backend
PASS_SCOUT_MODE=local HEAVY_MAPS_ENABLED=1 MPLBACKEND=Agg \
  python3 scripts/extract_test_site_data.py
```

O script está em `xpv-xp_site/backend/scripts/extract_test_site_data.py` e grava em `test-site-xpxpv/data/`.
