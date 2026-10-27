import { registerSW } from 'virtual:pwa-register';
import { startPlaytest } from './playtest';
import './style.css';

registerSW({ immediate: true });

const app = document.querySelector<HTMLElement>('#app');
if (app) startPlaytest(app);
