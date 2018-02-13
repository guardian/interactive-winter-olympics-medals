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
}



fullBoardButton.addEventListener('click', () => {
	document.querySelector('.other-country-block').className = 'other-country-block';
	fullBoardButton.className = 'expand-leaderboard hidden';
});

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

const $ = sel => document.querySelector(sel)

try {
	const figure = $('.pye-stream')
	const arrow = $('.pye-swipe-arrow')

	const isAndroidApp = window.location.origin === "file://" && /(android)/i.test(navigator.userAgent)

	figure.addEventListener('touchstart', () => {

		if (isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch) {
		    window.GuardianJSInterface.registerRelatedCardsTouch(true);
		}
	})

	figure.addEventListener('touchend', () => {
		if (isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch) {
	    	window.GuardianJSInterface.registerRelatedCardsTouch(false);
	    }
	})

	figure.addEventListener('scroll', () => {
		arrow.classList.add('pye-swipe-arrow--hidden')
	})

} catch (err) { console.log(err) }