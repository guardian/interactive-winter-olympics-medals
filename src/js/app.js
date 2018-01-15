// javascript goes here

document.querySelector("#countries-dropdown").addEventListener("change", (e) => {
	const newCountry = e.srcElement.value;

	document.body.className = "select-" + newCountry;
});