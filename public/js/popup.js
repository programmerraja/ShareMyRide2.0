function closePopup()
{
	//for admin page and myrides
	let loading_wrapper=document.querySelector(".loading_wrapper")
	if(loading_wrapper){
		loading_wrapper.classList.toggle("invisible");
	}

	var popup_container=document.querySelector(".popup_container");
	popup_container.style.display="none";
}

function main(){
	var popup_button=document.querySelector(".popup_button");
	popup_button.addEventListener("click",closePopup);
}
main();
