import {build} from 'esbuild';
await build({entryPoints:['supabase/functions/duelverse-game50/index.mjs'],bundle:true,format:'esm',platform:'neutral',target:'es2022',outfile:'supabase/functions/duelverse-game50/deploy.js',legalComments:'none'});
await build({entryPoints:['client/game-account50.mjs'],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,outfile:'public/game/platform/account-client50.mjs',legalComments:'eof'});
