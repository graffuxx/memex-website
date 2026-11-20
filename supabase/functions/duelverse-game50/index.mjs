import {createGameHandler} from '../../../server/game/handler50.mjs';
Deno.serve(createGameHandler({env:name=>Deno.env.get(name)}));
