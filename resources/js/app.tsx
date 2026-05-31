import {Inertia} from "@inertiajs/inertia";
require('./bootstrap');
import React from 'react';
import { render } from 'react-dom';
import { createInertiaApp } from '@inertiajs/inertia-react';
import { InertiaProgress } from '@inertiajs/progress';
import './Services/I18nService';
import '../css/app.css';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import ptBR from 'date-fns/locale/pt-BR';
registerLocale('pt-BR', ptBR);
setDefaultLocale('pt-BR');

const savedTheme = window.localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark', savedTheme ? savedTheme === 'dark' : prefersDark);
document.body?.classList.toggle('dark-app', document.documentElement.classList.contains('dark'));

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Webchats';
let stale = false;
window.addEventListener('popstate', () => { stale = true; });
Inertia.on('navigate', (event) => {
    const page = event.detail.page;
    if (stale) { Inertia.get(page.url, {}, { replace: true, preserveState: false }); }
    stale = false;
});

createInertiaApp({
    title: title => `${title} - ${appName}`,
    resolve: name => require(`./Pages/${name}.tsx`),
    setup({ el, App, props }) { return render(<App {...props} />, el); },
});
InertiaProgress.init({ color: '#611199' });
