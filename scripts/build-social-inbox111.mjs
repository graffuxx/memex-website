import {build} from 'esbuild';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
await build({stdin:{contents:"import React from 'react';import{createRoot}from'react-dom/client';import SocialBubble111 from './src/components/portal/SocialBubble111';createRoot(document.getElementById('inbox111')).render(<SocialBubble111 embedded/>);",loader:'tsx',resolveDir:root},bundle:true,format:'esm',platform:'browser',target:'es2020',minify:true,supported:{'template-literal':false},define:{'process.env.NODE_ENV':'"production"'},outfile:path.join(root,'public/game/platform/social-inbox-app111.js')});
