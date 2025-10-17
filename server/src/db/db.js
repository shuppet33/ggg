export const gameState = {
    started: false
}

export const tasks = [
    {id: 0, title: "Идентификация цели", hint: "Подсказка 1", code: "connection"},
    {id: 1, title: "Обезвреживание скрипта", hint: "Подсказка 2", code: "debugger"},
    {id: 2, title: "Перехват и дешифровка", hint: "Подсказка 3", code: "mask"},
    {id: 3, title: "Восстановление кода доступа", hint: "Подсказка 4", code: "entrance"},
    {id: 4, title: "Сборка аппаратного ключа", hint: "Подсказка 4", code: "energy"},
    {id: 5, title: "Тест безопасности", hint: "Подсказка 4", code: "defense"}
]


export const teams = [
    {
        name: 'ssss',
        password: '$2b$12$ilFunPH6yVrLJLdpCsvUtePi5V4Myw8POvFlhsDGPpQWs5TBralC2',
        order: [ 0, 1, 2, 3 ],
        currentTaskIndex: 0,
        finished: false
    }
]

export const admins = [
    {
        admin: 'admin',

    }
]




