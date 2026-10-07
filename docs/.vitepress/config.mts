import { defineConfig, type DefaultTheme } from 'vitepress'
import jumperGrammar from './jumper.tmLanguage.json'

const repo = 'https://github.com/jumper-lang'

function sidebar(prefix: string, t: Record<string, string>): DefaultTheme.SidebarItem[] {
  return [
    {
      text: t.start,
      items: [
        { text: t.intro, link: `${prefix}/introduction` },
        { text: t.gettingStarted, link: `${prefix}/getting-started` },
      ],
    },
    {
      text: t.language,
      items: [
        { text: t.basics, link: `${prefix}/language/basics` },
        { text: t.tables, link: `${prefix}/language/tables-and-arrays` },
        { text: t.functions, link: `${prefix}/language/functions` },
        { text: t.classes, link: `${prefix}/language/classes` },
        { text: t.modules, link: `${prefix}/language/modules` },
        { text: t.builtins, link: `${prefix}/language/built-in-functions` },
        { text: t.interop, link: `${prefix}/language/java-interop` },
        { text: t.differences, link: `${prefix}/language/differences` },
      ],
    },
    {
      text: t.java,
      items: [
        { text: t.embedding, link: `${prefix}/java/embedding` },
        { text: t.configs, link: `${prefix}/java/configs` },
      ],
    },
    {
      text: t.security,
      items: [
        { text: t.policies, link: `${prefix}/security/access-policies` },
        { text: t.hosts, link: `${prefix}/security/hosts` },
      ],
    },
    {
      text: t.tools,
      items: [{ text: t.toolsPage, link: `${prefix}/tools/` }],
    },
  ]
}

const en = {
  start: 'Start', intro: 'Introduction', gettingStarted: 'Getting started',
  language: 'Language', basics: 'Basics', tables: 'Tables and arrays', functions: 'Functions', classes: 'Classes',
  modules: 'Modules', builtins: 'Built-in functions', interop: 'Java interop', differences: 'Differences from Java',
  java: 'Embedding in Java', embedding: 'Embedding', configs: 'Configs',
  security: 'Security and hosts', policies: 'Access policies', hosts: 'Hosts',
  tools: 'Tools', toolsPage: 'CLI, editors, LSP',
}

const ru = {
  start: 'Начало', intro: 'Введение', gettingStarted: 'Быстрый старт',
  language: 'Язык', basics: 'Основы', tables: 'Таблицы и массивы', functions: 'Функции', classes: 'Классы',
  modules: 'Модули', builtins: 'Встроенные функции', interop: 'Работа с Java', differences: 'Отличия от Java',
  java: 'Встраивание в Java', embedding: 'Встраивание', configs: 'Конфиги',
  security: 'Безопасность и хосты', policies: 'Политики доступа', hosts: 'Хосты',
  tools: 'Инструменты', toolsPage: 'CLI, редакторы, LSP',
}

export default defineConfig({
  title: 'Jumper',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#6bb647' }],
  ],

  markdown: {
    languages: [{ ...(jumperGrammar as any), name: 'jumper', aliases: ['jmp', 'jmc', 'jma'] }],
  },

  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [{ icon: 'github', link: `${repo}/jumper` }],
    search: {
      provider: 'local',
      options: {
        locales: {
          ru: {
            translations: {
              button: { buttonText: 'Поиск', buttonAriaLabel: 'Поиск' },
              modal: {
                displayDetails: 'Подробный список',
                resetButtonTitle: 'Сбросить поиск',
                backButtonTitle: 'Закрыть поиск',
                noResultsText: 'Ничего не найдено по запросу',
                footer: { selectText: 'выбрать', navigateText: 'перейти', closeText: 'закрыть' },
              },
            },
          },
        },
      },
    },
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      description: 'A scripting language for the JVM with the syntax of Java and the lightness of Lua',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/getting-started', activeMatch: '^/(introduction|getting-started|language|java|security)' },
          { text: 'Tools', link: '/tools/' },
          { text: 'Releases', link: `${repo}/jumper/releases` },
        ],
        sidebar: sidebar('', en),
        editLink: {
          pattern: `${repo}/jumper-lang.github.io/edit/main/docs/:path`,
          text: 'Edit this page on GitHub',
        },
        footer: { message: 'Released under the MIT License.' },
      },
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/ru/',
      description: 'Скриптовый язык для JVM с синтаксисом Java и лёгкостью Lua',
      themeConfig: {
        nav: [
          { text: 'Руководство', link: '/ru/getting-started', activeMatch: '^/ru/(introduction|getting-started|language|java|security)' },
          { text: 'Инструменты', link: '/ru/tools/' },
          { text: 'Релизы', link: `${repo}/jumper/releases` },
        ],
        sidebar: sidebar('/ru', ru),
        editLink: {
          pattern: `${repo}/jumper-lang.github.io/edit/main/docs/:path`,
          text: 'Изменить эту страницу на GitHub',
        },
        footer: { message: 'Распространяется под лицензией MIT.' },
        outline: { label: 'На этой странице' },
        docFooter: { prev: 'Назад', next: 'Далее' },
        lastUpdated: { text: 'Обновлено' },
        darkModeSwitchLabel: 'Тема',
        lightModeSwitchTitle: 'Светлая тема',
        darkModeSwitchTitle: 'Тёмная тема',
        sidebarMenuLabel: 'Меню',
        returnToTopLabel: 'Наверх',
        langMenuLabel: 'Язык',
        notFound: {
          title: 'СТРАНИЦА НЕ НАЙДЕНА',
          quote: 'Такой страницы нет. Возможно, она переехала.',
          linkText: 'На главную',
        },
      },
    },
  },
})
