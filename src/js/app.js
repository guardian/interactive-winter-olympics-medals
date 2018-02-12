// javascript goes here

const fullBoardButton = document.querySelector('.expand-leaderboard');
const rowHeaders = document.querySelectorAll('.row--header');

const firstButton = document.querySelector('.item-button');
const firstCategory = document.querySelector('.sports-category');
const firstRowHeader = document.querySelector('.row--header');

try {

firstButton.className = 'item-button item-button--collapse';
firstCategory.className = 'sports-category sports-category--show';
firstRowHeader.className = 'row row--header row--header--open';

} catch (err) {
	console.log('caught this:', err)
}



fullBoardButton.addEventListener('click', () => {
	document.querySelector('.other-country-block').className = 'other-country-block';
	fullBoardButton.className = 'expand-leaderboard hidden';
});

console.log('attached listener')

rowHeaders.forEach(header => header.addEventListener('click', e => {
	const button = e.currentTarget.getElementsByTagName('button')[0];
	const selectedSportsCategory = header.nextElementSibling;
	const openSportsCategories = document.querySelectorAll('.sports-category--show');
	const collapseButtons = document.querySelectorAll('.item-button--collapse');

	if (button.className === 'item-button item-button--expand') {
		header.className = 'row row--header row--header--open row-with-border';
		firstRowHeader.className = 'row row--header row--header--open';
		button.className = ('item-button item-button--collapse');
		selectedSportsCategory.classList.remove('sports-category--hide');
		selectedSportsCategory.className = 'sports-category sports-category--show';
		openSportsCategories.forEach(category => category.className = 'sports-category sports-category--hide');
		collapseButtons.forEach(button => button.className = 'item-button item-button--expand');

	} else {
		header.className = 'row row--header row--header--closed row-with-border';
		firstRowHeader.className = 'row row--header';
		button.className = 'item-button item-button--expand';
		selectedSportsCategory.className = 'sports-category sports-category--hide';
	}
}));