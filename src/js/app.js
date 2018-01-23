// javascript goes here

const fullBoardButton = document.querySelector('.expand-leaderboard');
const rowHeaders = document.querySelectorAll('.row--header');

const firstButton = document.querySelector('.item-button');
const firstCategory = document.querySelector('.sports-category');

firstButton.className = 'item-button item-button--collapse';
firstCategory.className = 'sports-category sports-category--show';



fullBoardButton.addEventListener('click', () => {
	document.querySelector('.other-country-block').className = 'other-country-block';
	fullBoardButton.className = 'expand leaderboard hidden';
});

rowHeaders.forEach(header => header.addEventListener('click', e => {
	const button = e.currentTarget.getElementsByTagName('button')[0];
	const plusImg = button.getElementsByTagName('img')[0];
	const minusDiv = button.getElementsByTagName('div')[0];
	const selectedSportsCategory = header.nextElementSibling;
	const openSportsCategories = document.querySelectorAll('.sports-category--show');
	const collapseButtons = document.querySelectorAll('.item-button--collapse');

	if (button.className === 'item-button item-button--expand') {
		header.className = 'row row--header row--header--closed';
		button.className = ('item-button item-button--collapse');
		selectedSportsCategory.classList.remove('sports-category--hide');
		selectedSportsCategory.className = 'sports-category sports-category--show';
		openSportsCategories.forEach(category => category.className = 'sports-category sports-category--hide');
		collapseButtons.forEach(button => button.className = 'item-button item-button--expand');

	} else {
		header.className = 'row row--header';
		button.className = 'item-button item-button--expand';
		selectedSportsCategory.className = 'sports-category sports-category--hide';
	}
}));