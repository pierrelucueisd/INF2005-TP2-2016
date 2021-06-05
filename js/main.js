/*
	@titre du fichier: main.js	
	@auteur: Pierre-Luc Maître, Kevin Lim
	@code permanent: MAIP20118804, Limk15019302
	@date d'édition: 10/12/2016
	@description: le fichier permet d'instacier des objets des librairies de vouvement et de chronomètres coulées entre elles.
	le fichier permet également de gérer l'interface graphique du programme.
*/



/*variables globales */
var lesElementsToogle = {
	estCache: [], 
	estAffiche: []
};



/* précondotion: le lien appelant conten un texte préfixé du mot caché ou du mot afficher,
 * ce lien a l'attribut onclic qui appelle cete fonction avec comme deuxième paramètre un tableau de chaine représentant les sé
 * lecteur jquery */
/* amélioration s possible: un observateur des commandes agissant sur un élément dans la liste de manière à acualiser tous les affichages */

function toogleAffichagerCacherTexte(src){
	var cacherPat = new RegExp("^\\s*[Cc]acher");
	var afficherPat = new RegExp("^\\s*[Aa]fficher");
	if(cacherPat.test(src.text())){
	   setTextToAffiche(src);
	   return "Cacher";
	}
	if(afficherPat.test(src.text())){
		setTextToCache(src);
		return "Afficher";
	}
	
}

function setTextToCache(src){
	var afficherPat = new RegExp("^\\s*[Aa]fficher");
	src.text(src.text().replace(afficherPat, "Cacher"));
}

function setTextToAffiche(src){
	var cacherPat = new RegExp("^\\s*[Cc]acher");
	src.text(src.text().replace(cacherPat, "Afficher"));
}

function toogleListeBalise(e, ls) {
	var src = $(getEvTarget(e));
	statut = toogleAffichagerCacherTexte(src);
	if(statut == "Cacher"){
		for(idBal in ls)$(ls[idBal]).hide();
	}else if(statut == "Afficher"){
		for(idBal in ls) $(ls[idBal]).show();
	}
}

function changeOpacite(balise, nombre) {
	$(balise).css({
		opacity: nombre
	});
}

function getEvTarget(e){
	e = e || window.event;
	return e.target || e.srcElement;
}


/* main */
$(document).ready(function () {
	/* instanciation de la galerie de photos */
    $('#slider').rhinoslider({
        captionsOpacity: 100,
        captionsFadeTime: 100,
        showCaptions: 'always',
        showControls: 'always',
        effectTime: 100,
        slidePrevDirection: 'toRight',
        slideNextDirection: 'toLeft'
    });
	
	
	
	
	/*=============================*/
	/* setter data des villes */
	var villes = [
		{id: 1, nom: "Edmonton", x: 264, y: 633, tempAtt: 2000},
		{id: 2, nom: "Regina", x: 363, y: 716, tempAtt: 2000},
		{id: 3, nom: "Winnipeg", x: 466, y: 732, tempAtt: 2000},
		{id: 4, nom: "Toronto", x: 731, y: 830, tempAtt: 2000},
		{id: 5, nom: "St. John's", x: 1048, y: 578, tempAtt: 2000},
		{id: 6, nom: "Fredericton", x: 890, y: 710, tempAtt: 2000},
		{id: 7, nom: "Halifax", x: 950, y: 718, tempAtt: 2000},
		{id: 8, nom: "Charlottetown", x: 938, y: 682, tempAtt: 2000},
		{id: 9, nom: "Montréal", x: 806, y: 766, tempAtt: 2000}
	];
	/* setter data des villes */
	var lesAvions = [
		{nom: "boeing 747", vitesse: 800, url:"img/plane.png"},
		{nom: "hélico", vitesse: 300, url:"img/helicopter.png"},
		{nom: "oiseau", vitesse: 40, url:"img/bird.png"}
	];
	/* ------------------------------------------------------------------------- */

	/* les balises */
	var selectVille = $("#formulaireAjoutEscale > #selectVille");
	var selectAvion = $("#selectAvion");
	var listeDesEscales = $("#listeEscales .liste");
	/*---------------------------------------------------------------------------*/

	
	for (var i = 0; i < villes.length; i++) {
		selectVille.append($('<option>', {
			value: i,
			text: villes[i].nom
		}));
	}
	
	selectVille.on("change", function () {
		/*var test = selectVille.children("option").filter(":selected").text();*/
		var id = this.value;
		var marginTop = 50;
		listeDesEscales.append(
				'<div class="escale" style="margin-top:' + marginTop + 'px;">' +
				villes[id].nom +
				'<input type="hidden" name="idVille" value="' + id + '" />' +
				'<button class="remove">remove</button><br/>' +
				'</div>'
				);
		this.value = -1;
	});


	$("#soumettreListeEscale").on("click", function () {
		var tabEscale = listeDesEscales.children(".escale");
		var villeChoisies = [];
		for (var i = 0; i < tabEscale.length; i++) {
			var escaleBalise = $(tabEscale[i]);
			var idVille = escaleBalise.children("input").filter(":hidden[name$='idVille']").val();

			villeChoisies.push(villes[idVille]);
		}
		var idAvion = selectAvion.val();
		if(idAvion == 0){
			$("#carre").css("background-image", "url(img/plane.png)");
		}
		else if(idAvion == 1){
			$("#carre").css("background-image", "url(img/helicopter.png)");
								}
		else if(idAvion == 2){
			$("#carre").css("background-image", "url(" + lesAvions[idAvion].url + ")");
		}
		var avionChoisie = lesAvions[idAvion];
		initialiserTrajet(villeChoisies, avionChoisie);
	});



	$(document).on('click', '#listeEscales .liste .remove', function () {
		$(this).parent(".escale").remove();
	});
	

	for (var i = 0; i < lesAvions.length; i++) {
		selectAvion.append($('<option>', {
			value: i,
			text: lesAvions[i].nom + "\t" + lesAvions[i].vitesse + "km/h"
		}));
	}


	var avion; /*variable globale de l'avion */

	/*=============================*/
	/* instanciation du trajet choisis */
	function initialiserTrajet(villeChoisies, avionChoisie) {
		if (avion != null) {
			avion.viderMov();
		}
		/*initialisation du canevas */
		var c = document.getElementById("leCanevas");
		c.width = 1100;
		c.height = 891;
		var ctx = c.getContext("2d");

		/* génère les points des villes sélectionnées */
		for (var i = 0; i < villeChoisies.length; i++) {
			ctx.moveTo(villeChoisies[i].x, villeChoisies[i].y);
			ctx.arc(villeChoisies[i].x, villeChoisies[i].y, 10, 0, 2 * Math.PI);
			ctx.fill();
		}

		var nouvCompteur = new compteurTemps();
		avion = new ObjetDeplacable($("#carre"), nouvCompteur, avionChoisie);
		avion.dateDebut = new Date();
		avion.positionne(villeChoisies[0].x, villeChoisies[0].y);
		var dernierTemps = avion.dateDebut;

		for (var i = 1; i < villeChoisies.length; i++) {
			var villeA = villeChoisies[i - 1];
			var villeB = villeChoisies[i];
			var vecteurMov = new movVecteur(avion, dernierTemps, villeA, villeB);
			avion.ajouterMov(vecteurMov);
			dernierTemps = vecteurMov.dateFin;
			if (i < villeChoisies.length - 1) {
				var mouvAttenteI = new mouvAttente(avion, dernierTemps, 3600000);
				avion.ajouterMov(mouvAttenteI);
				dernierTemps = mouvAttenteI.dateFin;
			}

			ctx.moveTo(villeA.x, villeA.y);
			ctx.lineTo(villeB.x, villeB.y);
			ctx.stroke();

		}
	}

	/*--------------------------------*/
	/* commandes de déplacement de l'avion */
	$("#pause").click(function () {
		avion.setVitesseTemporelle(0);
	});

	$("#play").click(function () {
		avion.setVitesseTemporelle(3600);
	});

	$("#foward").click(function () {
		avion.setVitesseTemporelle(-3600);
	});


	$("#vider").click(function () {
		avion.viderMov();
	});

	$("#increm").click(function () {
		avion.setVitesseTemporelle(avion.vitesseTemporelle * 2);
	});

	$("#decrem").click(function () {
		avion.setVitesseTemporelle(avion.vitesseTemporelle / 2);
	});
	
	
	
	$("#carre").click(function(){
		$("#itineraire").toggle();
	});
});
