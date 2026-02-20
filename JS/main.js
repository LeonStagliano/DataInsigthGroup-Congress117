// -----------------------------------Modificacion del texto del Acordeón del Home-----------------------------------

if (document.title === "Home") {

    let accordionBtn = document.querySelector(".accordion-button")

    accordionBtn.addEventListener(`click`, (e) => {
        if (accordionBtn.textContent === "Read Less") {
            accordionBtn.textContent = "Read More"
        } else {
            accordionBtn.textContent = "Read Less"
        }
    })

}

// --------------------------------- FUNCIONAMIENTO DE LAS TABLAS DE LISTADO DE MIEMBROS ----------------------------

if (document.title === "Senate Congress 117" || document.title === "House Congress 117") {

    const tbody = document.querySelector(".tbody")
    const select = document.querySelector(".select")
    const form = document.getElementById("form")
    
    let chamberName
    let chamberMembers

    // Selección de Cámara
    
    if (document.title === "Senate Congress 117") {
        chamberName = `senate`
    }
    if (document.title === "House Congress 117") {
        chamberName = `house`
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
                .then(data => chamberMembers = data.results[0].members)

            printTable(chamberMembers, tbody)

            const states = []
            chamberMembers.forEach(member => states.includes(member.state) ? `` : states.push(member.state))
            states.sort()

            selectOptions(states, select)

            // Escucha de Formulario de Filtros y Chequeo de Valores - Ejecucion de Tabla Filtrada

            let membersFiltered

            form.addEventListener(`change`, (e) => {
                let checkValues = check()
                if (checkValues.length === 0 && select.value === "All") {
                    printTable(chamberMembers, tbody)
                } else if (checkValues.length === 0) {
                    membersFiltered = stateFilter(chamberMembers)
                    printTable(membersFiltered, tbody)
                } else {
                    membersFiltered = partysFilter(chamberMembers, checkValues)
                    membersFiltered = stateFilter(membersFiltered)
                    printTable(membersFiltered, tbody)
                }

                // Control de Alerta de Tabla vacia

                let alertContainer = document.querySelector(".alert-container")

                if (tbody.childElementCount === 0) {
                    alertContainer.classList = "alert-container"
                } else {
                    alertContainer.classList = "alert-container visually-hidden"
                }
            })
        }
        catch {
            console.log(`malió sal`)
        }
    }

    getData()


    // ------------------------------------------------- FUNCIONES --------------------------------------------------   

    // Impresión de la Tabla

    function printTable(members, element) {
        element.innerHTML = ``

        let fragment = document.createDocumentFragment()

        members.forEach(member => {
            let row = document.createElement("TR")
            let name = document.createElement("TD")
            let link = document.createElement("A")
            link.setAttribute(`HREF`, member.url)
            link.setAttribute(`TARGET`, "_blank")
            link.classList = `link-dark fw-bold text-decoration-none member-name`
            let aText = document.createTextNode(`${member.last_name}, ${member.first_name} ${member.middle_name ? member.middle_name : ""}`.trim())
            link.appendChild(aText)
            name.appendChild(link)
            row.appendChild(name)
            let party = document.createElement("TD")
            party.textContent = member.party
            row.appendChild(party)
            let state = document.createElement("TD")
            state.textContent = member.state
            row.appendChild(state)
            let seniority = document.createElement("TD")
            seniority.textContent = member.seniority
            row.appendChild(seniority)
            let votes = document.createElement("TD")
            votes.textContent = `${member.votes_with_party_pct} %`
            row.appendChild(votes)

            fragment.appendChild(row)

        })

        element.appendChild(fragment)
    }

    // Impresión de las opciones del Filtro de Estados (Select)

    function selectOptions(states, element) {
        element.innerHTML = ``

        let fragment = document.createDocumentFragment()

        let allStates = document.createElement("OPTION")
        allStates.setAttribute("VALUE", "All")
        allStates.classList = "option"
        allStates.textContent = "All States"
        fragment.appendChild(allStates)

        states.forEach(state => {
            let option = document.createElement("OPTION")
            option.setAttribute("VALUE", state)
            option.classList = "option"
            option.textContent = state

            fragment.appendChild(option)
        })

        element.appendChild(fragment)
    }

    // Captura de Valores del Filtro de Partidos (Checkbox)

    const check = () => Array.from(document.querySelectorAll("input[type=checkbox]")).filter(input => input.checked).map(input => input.value)

    // Filtrado por Partido

    function partysFilter(membersToFilter, condition) {
        let filteredByParty = membersToFilter.filter(member => condition.includes(member.party))
        return filteredByParty
    }

    // Filtrado por Estado

    function stateFilter(membersToFilter) {
        let filteredByState = membersToFilter.filter(member => member.state === select.value || select.value === "All")
        return filteredByState
    }
}
