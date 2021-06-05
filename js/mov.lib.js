/*
	@titre du fichier: style.css
	@auteur: Pierre-Luc Maître, Kevin Lim
	@code permanent: MAIP20118804, Limk15019302
	@date d'édition: 10/12/2016
	@description: la librairie couplée avec le chronomètre permet de définir des mouvements vectoriels et attentes selon 
	un temps definies en intervalle de dates réelles et selon une échelle de déroulement temporelle. Les mouvments sont
	stokés dans une file d'éxécution. Un seul mouvement à la fois peut être éxécuté. POur plusieurs mouvements à la fois,
	ces mouvements devraient être définis comme un mouvemen composés.
*/
        var kmParPixels = 5.40655;
		var nbMilisecParHeure = 3600000;
		
        function mouvAttente(objet, dateDebut, temps){
            this.debut = 0;
            this.element = objet;
            this.temps = temps;
            this.tempsPasse = 0;
            this.timer = null;
            this.statut = "fini";
            this.sens = "+";
            this.dateDebut = dateDebut;
            this.tempsReel = temps;
            this.dateFin = new Date(temps + dateDebut.getTime());
        }
        
        mouvAttente.prototype.setVitesse = function(v){
            clearTimeout(this.timer);
            if(this.statut != "pause" && this.statut != "fini"){
                d = new Date();
                this.tempsPasse += d.getTime() - parseInt(this.debut);
            }
            if(v == 0){
                this.statut = "pause";
            }
            if(v != 0){
                var tempsSeter;
                if(v < 0 && this.sens == "+" && this.statut != "fini"){
                    this.tempsPasse = this.temps - this.tempsPasse;
                    this.sens = "-";
                }else if(v > 0 && this.sens == "-" && this.statut != "fini"){
                    this.tempsPasse = this.temps - this.tempsPasse;
                    this.sens = "+";
                }
                d = new Date();
                this.debut = d.getTime();
                if(this.statut != "enCours"){
                    this.statut = "enCours";
                }
                tempsSeter = (this.temps-this.tempsPasse)/Math.abs(v);
                parseInt(tempsSeter);
                var ceci = this;
                this.timer = setTimeout(function(){
                    ceci.tempsPasse = 0;
                    ceci.statut = "fini";
                    ceci.element.iterer();
                }, tempsSeter);
            }
        };
        
        function movVecteur(objet, dateDebut, villeA, villeB){
            this.vitesse = 0;
            this.villeA = villeA;
            this.villeB = villeB;
            this.element = objet;
            this.xDebut = villeA.x;
            this.yDebut = villeA.y;
            this.xFin = villeB.x;
            this.YFin = villeB.y;
            this.distanceTotalePx = distanceEntreDeuxPoints(this.xDebut, this.yDebut, this.xFin, this.YFin);
            this.distanceTotaleReel = this.distanceTotalePx * kmParPixels;
            this.dateDebut = dateDebut;
            this.tempsReel = parseInt(this.distanceTotalePx/(this.element.vitesseObj/kmParPixels)*3600000);
            this.dateFin = new Date(dateDebut.getTime() + this.tempsReel);
            /*if(((this.dateFin - this.dateDebut) - this.tempsReel) == 0){
            	alert("ok diff acceptable");
            }*/
        }
        
        movVecteur.prototype.distanceReeleRestante = function(){
            return (this.distance(this.xFin, this.YFin)*kmParPixels).toFixed(2);
        };
        
        function distanceEntreDeuxPoints(x, y, x2, y2){
        	return Math.sqrt(Math.pow((x - x2), 2) + Math.pow((y - y2), 2));
        }
        
        movVecteur.prototype.distance = function(x, y){
            var xDebut = this.element.balise.position().left;
            var yDebut = this.element.balise.position().top;
            return distanceEntreDeuxPoints(x, y, xDebut, yDebut);
        };
        movVecteur.prototype.setVitesse = function(v){
            var ceci = this;
            this.element.balise.stop();
            if(v > 0){
                this.element.balise.animate({
                    left: this.xFin + "px",
                    top: this.YFin + "px"
                }, ((this.distance(this.xFin, this.YFin)/this.distanceTotalePx)*this.tempsReel/v),
                /* (this.distance(this.xFin, this.YFin)/v*1000) */
                function(){
                    ceci.element.iterer();
                });
            }else if(v < 0){
                this.element.balise.animate({
                    left: this.xDebut + "px",
                    top: this.yDebut + "px"
                }, ((this.distance(this.xDebut, this.yDebut)/this.distanceTotalePx)*this.tempsReel/-v),
                /* (this.distance(this.xDebut, this.yDebut)/-v*1000) */
                function(){
                    ceci.element.iterer();
                });
                
            }
            this.vitesse = v;
        };
        


/*===================================*/
		/* objet déplacable */
        function ObjetDeplacable(balise, compteur, avionChoisis){
            this.balise = balise;
            this.fileMouvement = [];
            this.movIndex = 0;
            this.vitesseTemporelle = 0;
            this.avionChoisis = avionChoisis;
            this.vitesseObj = avionChoisis.vitesse;
            this.dateDebut = null;
            this.compteur = compteur;
            this.movIndex = -1;
            this.compteur.objetAppelant = this;
        }
        
        
        ObjetDeplacable.prototype.positionne = function(x, y) {
            this.balise.css({
                "left": x + "px",
                "top": y + "px",
                "display" : "block"
            });
            $("#itineraire").css({
                "display" : "block"
            });
        };
        
        ObjetDeplacable.prototype.setVitesseObj = function(vitesseObj){
            this.vitesseObj = vitesseObj;
        };
        
        ObjetDeplacable.prototype.ajouterMov = function(mov){
            this.fileMouvement.push(mov);
        };
        
        ObjetDeplacable.prototype.viderMov = function(mov){
        	if(this.movIndex >= 0 && this.movIndex < this.fileMouvement.length){
        		this.fileMouvement[this.movIndex].setVitesse(0);
        	}
        	this.fileMouvement = null;
            
        };
        
        ObjetDeplacable.prototype.setDateDebut = function(dateDebut){
        	this.dateDebut = dateDebut;
        };
        
        ObjetDeplacable.prototype.setVitesseTemporelle = function(v){
            this.vitesseTemporelle = v;
            if(this.movIndex == -1){
            	this.iterer();
            }else{
            	var mouvementCourant = this.fileMouvement[this.movIndex];
	            mouvementCourant.setVitesse(this.vitesseTemporelle);
	            this.compteur.setVitesse(this.vitesseTemporelle);
            }
        };
        
        ObjetDeplacable.prototype.iterer = function(){
            if(this.vitesseTemporelle > 0 && this.movIndex < this.fileMouvement.length-1){
                this.movIndex++;
                var mouvementCourant = this.fileMouvement[this.movIndex];
                mouvementCourant.setVitesse(this.vitesseTemporelle);
                this.compteur.reinitialiser(mouvementCourant.dateDebut, mouvementCourant.dateFin);
            	mouvementCourant.setVitesse(this.vitesseTemporelle);
            	this.compteur.setVitesse(this.vitesseTemporelle);
            }
            if(this.vitesseTemporelle < 0 && this.movIndex >= 0 && this.fileMouvement.length >= 1){
                this.movIndex--;
                if(this.movIndex >= 0){
                	var mouvementCourant = this.fileMouvement[this.movIndex];
	                this.compteur.reinitialiser(mouvementCourant.dateDebut, mouvementCourant.dateFin, "countdown");
	                mouvementCourant.setVitesse(this.vitesseTemporelle);
	                this.compteur.setVitesse(this.vitesseTemporelle);
                }
            }
            
        };