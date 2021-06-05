/*
	@titre du fichier: style.css
	@auteur: Pierre-Luc Maître, Kevin Lim
	@code permanent: MAIP20118804, Limk15019302
	@date d'édition: 10/12/2016
	@description: la librairie chronomètre également couplée avec la librairie mouvement permet de créer un chronomètre temps réel dont le déroulement
	se fait selon une échelle temporelle changable en cours d'éxécution dont le nombre est un nombre réel positif, nul ou négatif(un vrai nombre réel!).
*/
var baseVitesse = 37;
var date0 = new Date();
        date0.setHours(0); 
        date0.setMilliseconds(0); 
        date0.setMinutes(0); 
        date0.setSeconds(0); 
        
        function compteurTemps(dateInit, dateStop){
            this.reinitialiser(dateInit, dateStop);
            this.afficheNbr(0);
        }
        
        compteurTemps.prototype.reinitialiser = function(dateInit, dateStop, test){
            this.stop();
            this.dateInit = dateInit;
            this.dateStop = dateStop;
            this.statut = "null";
            this.DebutCountdown = 0;
            this.accTempsPause = 0;
            this.tempsCompte = 0;
            this.tempsConvertis = 0;
            this.vitesse = 0;
            this.timer = null;
            this.debutComptage = 0;
            this.afficheNbr(0);
            this.ancienTempsCompte = 0;
            if(test == "countdown"){
                this.statut = "countdownInit";
            }
        };
        
        function afficherDate(d2){
            return " heure " + d2.getHours() + " min " + d2.getMinutes() + " sec: " + d2.getSeconds();
        }
        
        function obtienDateJourPlus(dateRef, nbrMilisec){
            var d2 = new Date(dateRef);
            d2.setHours(0); 
            d2.setMinutes(0); 
            d2.setSeconds(0); 
            return new Date(d2.getTime() + nbrMilisec);
        }
        
        
        
        
        
        compteurTemps.prototype.stop = function(){
            clearInterval(this.timer);
            this.timer = null;
        };
        
        compteurTemps.prototype.incrementeTempsConvertis = function(){
            this.tempsConvertis += (Math.abs(this.vitesse) * (this.tempsCompte - this.ancienTempsCompte));
        };
        
        
        compteurTemps.prototype.setVitesse = function(v){
            if(this.statut == "null" && v > 0){
                this.debutComptage = new Date().getTime();
            }
            this.vitesse = v;

            /* traiter stop*/
            if(v == 0){
                this.accTempsPause = this.tempsCompte;
                if(this.statut == "play"){
                    this.statut = "stopPlay";
                }else if(this.statut == "fw"){
                    this.statut = "stopFw";
                }
            }
             
            if(v > 0 && (this.statut == "fw" || this.statut == "stopPlay" || this.statut == "stopFw")){
                if(this.statut == "fw"){
                    this.tempsCompte = this.DebutCountdown - ((new Date).getTime() - this.debutComptage);
                    this.debutComptage = (new Date).getTime() - this.tempsCompte;
                }else{
                   this.debutComptage = (new Date).getTime() - this.accTempsPause;
                   if(this.statut == "stopPlay"){
                       this.tempsCompte = this.accTempsPause;
                   }
                }
                this.DebutCountdown = 0;
                this.accTempsPause = 0;
            }

            if(v < 0 && (this.statut == "play" || this.statut == "stopPlay" || this.statut == "stopFw")){
                if(this.statut == "play"){
                    this.tempsCompte =  (new Date).getTime() - this.debutComptage;
                }else{
                    this.tempsCompte = this.accTempsPause;
                }
                this.DebutCountdown = this.tempsCompte;
                this.debutComptage = (new Date).getTime();
            }
            var test;
            
            if(v < 0 && this.statut == "countdownInit"){
                this.tempsCompte = (this.dateStop.getTime() - this.dateInit.getTime()) / Math.abs(this.vitesse);
                this.DebutCountdown = this.tempsCompte;
                this.statut = "fw";
                this.ancienTempsCompte = 0;
                this.incrementeTempsConvertis();
                this.debutComptage = (new Date).getTime();
                
            }
            
            
            this.ancienTempsCompte = this.tempsCompte;
            /* traite final valeure play */
            if(v > 0){
                var tempsCompteHypo = (new Date).getTime() - this.debutComptage;
                var avantIncTempsRestant = this.ancienTempsCompte + ((this.dateStop - this.dateInit - this.tempsConvertis)/this.vitesse);
                if(tempsCompteHypo < avantIncTempsRestant){
                    this.tempsCompte = tempsCompteHypo;
                }else{ /* traite si on dépasse la date max */
                    this.tempsCompte = avantIncTempsRestant;
                    this.incrementeTempsConvertis();
                    this.afficheNbr(this.dateInit-this.dateStop);
                    this.setVitesse(0);
                    return;
                }
                this.statut = "play";
            }
            
            /* traite final valeure foward */
            if(v < 0){
               this.tempsCompte = this.DebutCountdown - ((new Date).getTime() - this.debutComptage);
               this.statut = "fw";
            }
            
            this.incrementeTempsConvertis();
            
            this.stop();
            if(this.tempsConvertis < 0){
                this.reinitialiser(this.dateInit, this.dateStop);
                return;
            }
            
            this.afficheNbr(parseInt(this.tempsConvertis));
            /* traiter le timer */
            if(v != 0){ 
                var ceci = this;
                if(this.timer == null){
                    this.timer = setInterval(function(){
                        ceci.setVitesse(v);
                    }, baseVitesse);
                }
            } 
        };
        




/* sert à l'affichage de la boîte du compteur */
        compteurTemps.prototype.afficheNbr = function(nbr){
            var d = new Date((new Date(this.dateInit)).getTime() + this.tempsConvertis); 
           
            var result = "jour:" + d.getDate() + " heure " + d.getHours() + " min " + d.getMinutes() + " sec: " + d.getSeconds();
            var result2 = afficherDate(obtienDateJourPlus(this.dateInit, nbr));
            var result3 = afficherDate(obtienDateJourPlus(this.dateInit, this.dateStop-this.dateInit-this.tempsConvertis));

            var indexObjMov;
            var villes;
            var vitesseAvion;
            if(this.objetAppelant != null && this.objetAppelant.movIndex < this.objetAppelant.fileMouvement.length){
                var mov = this.objetAppelant.fileMouvement[this.objetAppelant.movIndex];
                if(mov.constructor.name.toString() == "movVecteur"){
                    indexObjMov = mov.distanceReeleRestante() + "/" + mov.distanceTotaleReel.toFixed(2);
                    villes = "Départ:" + mov.villeA.nom + "\n Arrivée:" + mov.villeB.nom;
                    vitesseAvion = this.objetAppelant.vitesseObj + "km/h";
                }else{
                    indexObjMov = "";
                    villes = "en atente";
                    vitesseAvion = "en attente (0km/h)";
                }
            }
            $("#vitesseAvion").text(vitesseAvion);
            $("#villes").text(villes);
            $("#compteur2").text(result3);
            $("#distance").text(indexObjMov);
            $("#compteur").text(result);
            $("#tempsDepuis").text(result2);
            $("#vitesse").text("1:" + this.vitesse);
        };