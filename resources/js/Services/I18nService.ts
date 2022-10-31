/*
* FUNÇÃO TEMPORÁRIA ATÉ QUE SE DEFINA QUAL ESTRATÉGIA DE I18N SERÁ USADA NO FRONTEND!
*
* Atualmente serve apenas como função de echo, apenas para marcar onde teremos traduçòes a serem feitas no react.
*
* @TODO: encontrar uma lib apropriada para React, que interaja com o que temos no BE.
*/


export {}

declare global {
    function __ (term: string, ...params: any[]): string
}

const ptBR = require('./pt-BR.json');

const __ = (term: string, ...params: any[]): string => {
    return ptBR[term] ?? term;
}

// Global scope augmentation
const _global = (window || global) as any;

_global.__ = __;

