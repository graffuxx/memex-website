'use client';
import {usePathname} from 'next/navigation';
import SocialBubble111 from './SocialBubble111';
import {hideSocial114} from '../../../public/game/platform/presence114.mjs';
export default function SocialBubbleGate114(){const path=usePathname();return <SocialBubble111 hidden={hideSocial114(path??'')}/>;}
