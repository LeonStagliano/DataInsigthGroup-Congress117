const tbodyChamber = document.querySelector(".tbody-chamber")
const tbodyLeast = document.querySelector(".tbody-least")
const tbodyMost = document.querySelector(".tbody-most")

// Selección de Cámara
let chamberName
let chamberMembers

if (document.title === "Senate Attendance" || document.title === "Senate Loyalty") {
    chamberName = `senate`
}
if (document.title === "House Attendance" || document.title === "House Loyalty") {
    chamberName = `house`
}

// Estadísticas necesarias

let statistics = {
    parties: [
        {
            name: `Democrats`,
            abb: `D`
        },
        {
            name: `Republicans`,
            abb: `R`
        },
        {
            name: `Independents`,
            abb: `ID`
        }
    ],
    leastLoyals: [],
    mostLoyals: [],
    leastEngaged: [],
    mostEngaged: []
}

// ---------------------------------------------- Pedido de Datos ------------------------------------------------

const url = `https://api.propublica.org/congress/v1/117/${chamberName}/members.json`
const key = `OPnQTYwGj99AkEgxN4klLA0v4aLd6ZL3Hq373Xqq`

const options = {
    method: 'GET',
    headers: {
        "X-API-Key": key
    }
}

async function getData() {
    try {
        await fetch(url, options)
            .then(request => request.json())
            .then(data =>
                chamberMembers = data.results[0].members)

        // Miembros Por Partido y Promedio de Votos con partido

        statistics.parties.forEach((element, i) => {
            statistics.parties[i].members = chamberMembers.filter(member => member.party === element.abb)
            statistics.parties[i].averageVotes = averageOfVotes(statistics.parties[i].members).toFixed(2)
        })

        // El 10% Mas y Menos

        statistics.leastLoyals = leastTenPercent(chamberMembers, `votes_with_party_pct`)
        statistics.mostLoyals = mostTenPercent(chamberMembers, `votes_with_party_pct`)
        statistics.leastEngaged = mostTenPercent(chamberMembers, `missed_votes_pct`)
        statistics.mostEngaged = leastTenPercent(chamberMembers, `missed_votes_pct`)

        totalVotesWithParty(chamberMembers)

        fullName(chamberMembers)

        // Impresion de las Tablas

        printTables(tbodyChamber, statistics.parties, `members`, `averageVotes`)

        if (document.title === "House Attendance" || document.title === "Senate Attendance") {
            printTables(tbodyLeast, statistics.leastEngaged, `missed_votes`, `missed_votes_pct`)
            printTables(tbodyMost, statistics.mostEngaged, `missed_votes`, `missed_votes_pct`)
        }
        if (document.title === "House Loyalty" || document.title === "Senate Loyalty") {
            printTables(tbodyLeast, statistics.leastLoyals, `total_votes_with_party`, `votes_with_party_pct`)
            printTables(tbodyMost, statistics.mostLoyals, `total_votes_with_party`, `votes_with_party_pct`)
        }

    }
    catch {
        console.log(`malió sal`)
    }

}

getData()


// Se arma el "nombre completo", y se devuelve como propiedad a cada objeto "miembro" de la cámara.

function fullName(chamber) {
    for (member of chamber) {
        let fullName = `${member.last_name}, ${member.first_name} ${member.middle_name || ""}`.trim()
        member.full_name = fullName
    }
    return chamber
}
// Se obtiene el "Número de Votos con Partido", y se devuelve como propiedad a cada objeto "miembro" de la cámara.

function totalVotesWithParty(chamber) {
    for (member of chamber) {
        let totalVotesWithParty = percent(member.total_votes, member.votes_with_party_pct)
        member.total_votes_with_party = totalVotesWithParty
    }
    return chamber
}

// Promedio de Votos Leales del Partido

function averageOfVotes(party) {
    let averageOfVotes = party.filter(member => member.votes_with_party_pct).reduce((acc, act) => acc + act.votes_with_party_pct, 0) / party.length
    if (averageOfVotes) {
        return averageOfVotes
    } else {
        return 0
    }
}

// El 10% Mas y Menos

function leastTenPercent(chamber, property) {
    let least = [...chamber].filter(e => e[property] || e[property] === 0).sort((a, b) => smallestToLargest(a, b, [property]))
    reference = least[percent([...least].length, 10) - 1][property]
    return least.filter(element => element[property] <= reference)
}

function mostTenPercent(chamber, property) {
    let most = [...chamber].filter(e => e[property] || e[property] === 0).sort((a, b) => largestToSmallest(a, b, [property]))
    reference = most[percent([...most].length, 10) - 1][property]
    return most.filter(element => element[property] >= reference)
}

// Impresiones de Tablas

function printTables(element, col1Value, col2Value, col3Value) {
    element.innerHTML = ``

    let fragment = document.createDocumentFragment()

    if (element === tbodyLeast || element === tbodyMost) {

        col1Value.forEach(member => {
            let row = document.createElement("TR")
            let name = document.createElement("TD")
            let link = document.createElement("A")
            link.setAttribute(`HREF`, member.url)
            link.setAttribute(`TARGET`, "_blank")
            link.classList = `link-dark fw-bold text-decoration-none member-name`
            let aText = document.createTextNode(member.full_name)
            link.appendChild(aText)
            name.appendChild(link)
            row.appendChild(name)
            let col2 = document.createElement("TD")
            col2.textContent = member[col2Value]
            row.appendChild(col2)
            let col3 = document.createElement("TD")
            col3.textContent = member[col3Value]
            row.appendChild(col3)

            fragment.appendChild(row)
        })
    } else {
        let totalCol2 = 0
        let totalCol3 = 0
        let parties = []

        col1Value.forEach(item => {
            let row = document.createElement("TR")
            let col1 = document.createElement("TH")
            col1.textContent = item.name
            row.appendChild(col1)
            let col2 = document.createElement("TD")
            col2.textContent = item[col2Value].length
            totalCol2 = totalCol2 + item[col2Value].length
            row.appendChild(col2)
            let col3 = document.createElement("TD")
            col3.textContent = item[col3Value]
            totalCol3 = totalCol3 + parseInt(item[col3Value])
            if (parseInt(item[col3Value]) !== 0) {
                parties.push(1)
            }
            row.appendChild(col3)

            fragment.appendChild(row)
        })
        let row = document.createElement("TR")
        let col1 = document.createElement("TH")
        col1.textContent = `TOTAL`
        row.appendChild(col1)
        let col2 = document.createElement("TD")
        col2.textContent = totalCol2
        row.appendChild(col2)
        let col3 = document.createElement("TD")
        col3.textContent = (totalCol3 / parties.length).toFixed(2)
        row.appendChild(col3)

        fragment.appendChild(row)
    }
    element.appendChild(fragment)
}

// Funciones Utilitarias

function smallestToLargest(a, b, property) {
    if (a[property] < b[property]) {
        return -1
    }
    if (a[property] > b[property]) {
        return 1
    }
    return 0
}
function largestToSmallest(a, b, property) {
    if (a[property] > b[property]) {
        return -1
    }
    if (a[property] < b[property]) {
        return 1
    }
    return 0
}
function percent(total, percent) {
    let percentValue = (total / 100) * percent
    return Math.ceil(percentValue)
}