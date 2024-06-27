/* UserInfo element render */
const weekDays = [
	'sunday',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
]

function update() {
	const today = new Date()
	return weekDays[today.getDay()]
}

function getUserInfoTemplate(dayString) {
	return `
	<p class="user-info">
		What's up, gamer👋 <br />
		What a nice <strong>${dayString}</strong> to play something ;)
	</p>
	`
}

document.addEventListener('DOMContentLoaded', function () {
	const userInfo = document.getElementById('userInfo')
	const userInfoHTML = document.createElement('div')
	userInfoHTML.innerHTML = getUserInfoTemplate(update())
	userInfo.appendChild(userInfoHTML)
})

/* Adjacent of new table elements */
const inputGameTitle = document.getElementById('gameToAdd')
const inputGenres = document.getElementById('genresToAdd')
const inputPrice = document.getElementById('priceToAdd')
const inputService = document.getElementById('serviceToAdd')
const inputPublisher = document.getElementById('publisherToAdd')
const addGameBtn = document.getElementById('addBtn')
//
const filterBtn = document.getElementById('filterBtn')
const resetBtn = document.getElementById('resetFilterBtn')
const gamesTable = document.getElementById('gamesTable')
//
const games = []

function checkCorrectInput() {
	return (
		inputGameTitle.value.length > 0 &&
		inputGenres.value.length > 0 &&
		inputPrice.value.length > 0 &&
		!isNaN(parseFloat(inputPrice.value)) &&
		inputService.value.length > 0 &&
		inputPublisher.value.length > 0
	)
}

function insertInputtedData(game) {
	const doneStyle = game.isDone
		? 'style="color: rgba(175, 67, 252, 0.435);"'
		: ''
	return `<tr data-id="${game._id}">
			<td><button class="done-btn">✓</button></td>
			<td ${doneStyle}>${game.gameTitle}</td>
			<td ${doneStyle}>${game.genres}</td>
			<td ${doneStyle}>${game.price}</td>
			<td ${doneStyle}>${game.service}</td>
			<td ${doneStyle}>${game.publisher}</td>
			<td ${doneStyle}>${new Date().toLocaleDateString()}</td> 
	</tr>`
}

function clearInputFields() {
	inputGameTitle.value = ''
	inputGenres.value = ''
	inputPrice.value = ''
	inputService.value = ''
	inputPublisher.value = ''
}

addGameBtn.onclick = async function (event) {
	event.preventDefault()
	if (checkCorrectInput()) {
		console.log('Good input dude')
		const newGame = {
			gameTitle: inputGameTitle.value,
			genres: inputGenres.value,
			price: parseInt(inputPrice.value),
			service: inputService.value,
			publisher: inputPublisher.value,
		}
		try {
			const response = await fetch('/api/games', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newGame),
			})
			const game = await response.json()
			games.push(newGame)
			clearInputFields()
			gamesTable.insertAdjacentHTML('afterbegin', insertInputtedData(newGame))
			console.log(games.length)
		} catch (err) {
			console.error('Error:', err)
		}
	} else {
		errorMessage.style.display = 'block'
		setTimeout(function () {
			errorMessage.style.display = 'none'
		}, 2000)
		console.log('Bad input dude')
	}
}

// done button
gamesTable.addEventListener('click', async function (event) {
	//changed 27.06
	if (event.target && event.target.classList.contains('done-btn')) {
		const row = event.target.closest('tr')
		const gameId = row.getAttribute('data-id')
		const isDone = row.cells[1].style.color === 'rgba(175, 67, 252, 0.435)'
		const newDoneState = !isDone

		row.querySelectorAll('td').forEach(cell => {
			cell.style.color = newDoneState ? 'rgba(175, 67, 252, 0.435)' : ''
		})

		try {
			await fetch(`/api/games/${gameId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ isDone: newDoneState }),
			})
		} catch (err) {
			console.error('Failed to update game', err)
		}
	}
})

// Filter of games
filterBtn.onclick = function () {
	const filterOptions = document.getElementById('filterOptions')
	filterOptions.style.display =
		filterOptions.style.display === 'none' ? 'block' : 'none'
}

document.querySelectorAll('.filter-option').forEach(button => {
	button.onclick = function () {
		const filterType = button.getAttribute('data-filter')
		const filterValue = prompt(`Enter the ${filterType} to filter by:`)
		filterTable(filterType, filterValue)
	}
})

function filterTable(filterType, filterValue) {
	const rows = document.querySelectorAll('#gamesTable tbody tr')

	rows.forEach(row => {
		const cellValue = row.querySelector(
			`td:nth-child(${getFilterColumnIndex(filterType)})`
		).textContent
		if (cellValue.toLowerCase().includes(filterValue.toLowerCase())) {
			row.style.display = ''
		} else {
			row.style.display = 'none'
		}
	})
}

function getFilterColumnIndex(filterType) {
	switch (filterType) {
		case 'genre':
			return 3
		case 'price':
			return 4
		case 'service':
			return 5
		case 'publisher':
			return 6
		default:
			return 0
	}
}

resetBtn.onclick = function () {
	const rows = document.querySelectorAll('#gamesTable tbody tr')
	rows.forEach(row => {
		row.style.display = ''
	})
}

async function loadGames() {
	try {
		const response = await fetch('/api/games')
		if (!response.ok) {
			throw new Error(
				`Failed to load games: ${response.status} ${response.statusText}`
			)
		}
		const games = await response.json()
		if (!Array.isArray(games)) {
			throw new Error('Invalid data format')
		}
		games.forEach(game => {
			gamesTable.insertAdjacentHTML('beforeend', insertInputtedData(game))
		})
	} catch (err) {
		console.error('Error:', err.message)
	}
}

loadGames()
