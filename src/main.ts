import { registerSW } from 'virtual:pwa-register';
import { startApp } from './app';
import './style.css';

registerSW({ immediate: true });

const app = document.querySelector<HTMLElement>('#app');
if (app) void startApp(app);
