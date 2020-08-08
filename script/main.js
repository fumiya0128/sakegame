"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function main(param) {
    //var random = param.random;// 乱数生成器
    var scene = new g.Scene({
        game: g.game,
        assetIds: ["font16_1", "glyph_area_16","rule"]
    });
    var time = 50; // 制限時間
    var ruletime=5;//説明時間
    var timeall=1;//総合経過フレーム計算用(g.game.age)
    if (param.sessionParameter.totalTimeLimit) {
        time = param.sessionParameter.totalTimeLimit-ruletime-5; // セッションパラメータで制限時間が指定されたらその値を使用します
    }
    // 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
    g.game.vars.gameState = { score: 0 , playThreshold: 1};
    var playersize = 16;//自機サイズ
    scene.loaded.add(function () {
        // ここからゲーム内容を記述します
        var haikei = new g.FilledRect({
            scene: scene,
            cssColor: "white",
            width: g.game.width,
            height: g.game.height,
            opacity:0.9,
        });
        if (param.isAtsumaru) {
            haikei.opacity=1;
        }
        scene.append(haikei);
        //ルール表示
        var rule = new g.Sprite({
            scene: scene,
            src: scene.assets["rule"],
            opacity:1,
            x:-320,
            y:-180,
            scaleX:0.3,
            scaleY:0.3,
        });
        
        var glyph = JSON.parse(scene.assets["glyph_area_16"].data);
        var font = new g.BitmapFont({//フォント指定
            src: scene.assets["font16_1"],
            map: glyph,
            defaultGlyphWidth: 16,
            defaultGlyphHeight: 16
        });
        var scoreLabel = new g.Label({//スコア表示
            scene: scene,
            font: font,
            fontSize: 16,
            text: "0000" + g.game.vars.gameState.score,
            x: g.game.width - 16 * 5,
            y: 0
        });
        scene.append(scoreLabel);
        var timerLabel = new g.Label({//時間表示
            scene: scene,
            font: font,
            fontSize: 16,
            text: "50.0",
            x: 0, 
            y: 0
        });
        scene.append(timerLabel);
        scene.update.add(function (e) {//接触判定と減点
            squareme.opacity=1;
            squareme.modified();
            for (var i = 0; i < scene.children.length; i++) {//全オブジェクトを探索
                if (haikei !== scene.children[i] && squareme !== scene.children[i] && scoreLabel !== scene.children[i] && timerLabel !== scene.children[i] && rule !== scene.children[i]&& buttonretry !== scene.children[i]&& g.Collision.intersectAreas(squareme, scene.children[i]) && scene.children[i].opacity == 1.0) {//接触判定
                    if (Math.floor(time * 10 - (timeall-ruletime*g.game.fps) / g.game.fps * 10) > 0) {
                        if ("red" == scene.children[i].cssColor) {//色を判定
                            g.game.vars.gameState.score -= 70;
                        } else if ("blue" == scene.children[i].cssColor) {
                            g.game.vars.gameState.score -= 300;
                        } else if ("green" == scene.children[i].cssColor) {
                            g.game.vars.gameState.score -= 1000;
                        }//満点は15000
                    }
                    squareme.opacity=0.5;
                    squareme.modified();
                    scene.children[i].destroy();
                    i--;
                }
            }
        });
        function updateStatus() {//フレーム数と時間スコア加算
            g.game.vars.gameState.score += 10;
            if (g.game.vars.gameState.score <= 0) { g.game.vars.gameState.score = 0; }
            if (g.game.vars.gameState.score <= 9) {//スコアを文字列に変換
                scoreLabel.text = "0000" + g.game.vars.gameState.score;
            } else if (g.game.vars.gameState.score <= 99) {
                scoreLabel.text = "000" + g.game.vars.gameState.score;
            } else if (g.game.vars.gameState.score <= 999) {
                scoreLabel.text = "00" + g.game.vars.gameState.score;
            } else if (g.game.vars.gameState.score <= 9999) {
                scoreLabel.text = "0" + g.game.vars.gameState.score;
            } else if (g.game.vars.gameState.score <= 99999) {
                scoreLabel.text = "" + g.game.vars.gameState.score;
            }
            scoreLabel.invalidate();//スコア表示更新
            updateTimerLabel();
        }
        function updateTimerLabel() {//タイマー更新
            var s = Math.floor(time * 10 - (timeall-ruletime*g.game.fps) / g.game.fps * 10);
            var text = Math.floor(time * 10 - (timeall-ruletime*g.game.fps) / g.game.fps * 10) / 10 + (s % 10 === 0 ? ".0" : "");
            if (timerLabel.text != text) {//表示と実際の時間が違うときに更新
                timerLabel.text = text;
                timerLabel.invalidate();
            }
        }
        var squareme = new g.FilledRect({//自機
            scene: scene,
            cssColor: "black",
            x: (g.game.width - playersize) / 2,
            y: (g.game.height - playersize) / 2,
            width: playersize,
            height: playersize,
        });
        scene.append(squareme);
        scene.append(rule);
        scene.pointMoveCapture.add(function (ev) {//自機更新
            squareme.x += ev.prevDelta.x;
            if (squareme.x < 0) {
                squareme.x = 0;
            }
            if (squareme.x > g.game.width - squareme.width) {
                squareme.x = g.game.width - squareme.width;
            }
            squareme.y += ev.prevDelta.y;
            if (squareme.y < 0) {
                squareme.y = 0;
            }
            if (squareme.y > g.game.height - squareme.height) {
                squareme.y = g.game.height - squareme.height;
            }
            squareme.modified();
        });
        // 敵情報
        function generatesquarer() {//赤四角(バウンド)
            var edge = param.random.get(16, 32);
            var squarer = new g.FilledRect({
                scene: scene,
                cssColor: "red",
                width: edge,
                height: edge,
                x: param.random.get(0, 1) * (g.game.width) - edge / 2,
                y: param.random.get(0, 1) * (g.game.height) - edge / 2,
                opacity: 1.0
            });
            squarer.tag = {
                counter: 0,//四角が生成されてからのフレーム数
                xplus: "true",
                yplus: "true",
                xyspeed: param.random.get(3, 8),//速度
                xyangle: param.random.get(1, 89) / 90 * Math.PI / 2,//角度
            };
            squarer.update.add(function () {
                squarer.tag.counter++;
                //x座標
                if (squarer.x >= (g.game.width - squarer.width)) {
                    squarer.tag.xplus = "false";
                }
                if (squarer.x <= 0) {
                    squarer.tag.xplus = "true";
                }
                if (squarer.tag.xplus == "true") {
                    squarer.x = ((squarer.x) % (g.game.width + squarer.width)) + Math.cos(squarer.tag.xyangle) * squarer.tag.xyspeed;
                } else {
                    squarer.x -= Math.cos(squarer.tag.xyangle) * squarer.tag.xyspeed;
                }
                //y座標
                if (squarer.y >= (g.game.height - squarer.height)) {
                    squarer.tag.yplus = "false";
                }
                if (squarer.y <= 0) {
                    squarer.tag.yplus = "true";
                }
                if (squarer.tag.yplus == "true") {
                    squarer.y = ((squarer.y) % (g.game.height - squarer.height)) + Math.sin(squarer.tag.xyangle) * squarer.tag.xyspeed;
                } else {
                    squarer.y -= Math.sin(squarer.tag.xyangle) * squarer.tag.xyspeed;
                }
                if (squarer.tag.counter >= 300) {
                    squarer.opacity = (315 - squarer.tag.counter) / 15;
                }
                if (squarer.tag.counter >= 315) {
                    squarer.destroy();
                }
                //modified()変更をゲームに通知
                squarer.modified();
            });
            scene.append(squarer);//追加・描画
        }
        function generatesquareb() {//青四角(ループ)
            var edge = param.random.get(16, 32);
            var squareb = new g.FilledRect({
                scene: scene,
                cssColor: "blue",
                width: edge,
                height: edge,
                x: param.random.get(0, 1) * (g.game.width) - edge / 2,
                y: param.random.get(0, 1) * (g.game.height) - edge / 2,
                opacity: 1
            });
            squareb.tag = {
                counter: 0,//四角が生成されてからのフレーム数
                xyspeed: param.random.get(3, 5),//速度
                xyangle: (param.random.get(1, 89) / 180 + param.random.get(0, 3) / 2) * Math.PI//角度
            };
            squareb.update.add(function () {
                squareb.tag.counter++;
                //x座標
                squareb.x = ((squareb.x + squareb.width) % (g.game.width + squareb.width)) - squareb.width + Math.cos(squareb.tag.xyangle) * squareb.tag.xyspeed;
                //y座標
                squareb.y = ((squareb.y + squareb.height) % (g.game.height + squareb.height)) - squareb.height + Math.sin(squareb.tag.xyangle) * squareb.tag.xyspeed;
                if (squareb.tag.counter >= 600) {
                    squareb.opacity = (615 - squareb.tag.counter) / 15;
                }
                if (squareb.tag.counter >= 615) {
                    squareb.destroy();
                }
                //modified()変更をゲームに通知
                squareb.modified();
            });
            scene.append(squareb);//追加・描画
        }
        function generatesquareg() {//緑四角(追尾)
            var edge = param.random.get(16, 32);
            var squareg = new g.FilledRect({
                scene: scene,
                cssColor: "green",
                width: edge,
                height: edge,
                x: param.random.get(0, 1) * (g.game.width) - edge / 2,
                y: param.random.get(0, 1) * (g.game.height) - edge / 2,
                opacity: 1
            });
            squareg.tag = {
                counter: 0,//四角が生成されてからのフレーム数
                xyspeed: param.random.get(2, 5),//速度
                gx: squareg.x,//現在の座標
                gy: squareg.y
            };
            squareg.update.add(function () {
                squareg.tag.counter++;
                squareg.tag.gx = squareg.x + edge / 2;
                squareg.tag.gy = squareg.y + edge / 2;
                //x座標
                squareg.x = squareg.x + squareg.tag.xyspeed / Math.sqrt((((squareme.x + playersize / 2) - squareg.tag.gx) * ((squareme.x + playersize / 2) - squareg.tag.gx)) + (((squareme.y + playersize / 2) - squareg.tag.gy) * ((squareme.y + playersize / 2) - squareg.tag.gy))) * ((squareme.x + playersize / 2) - squareg.tag.gx);
                //y座標
                squareg.y = squareg.y + squareg.tag.xyspeed / Math.sqrt((((squareme.x + playersize / 2) - squareg.tag.gx) * ((squareme.x + playersize / 2) - squareg.tag.gx)) + (((squareme.y + playersize / 2) - squareg.tag.gy) * ((squareme.y + playersize / 2) - squareg.tag.gy))) * ((squareme.y + playersize / 2) - squareg.tag.gy);
                if (squareg.tag.counter >= 300) {
                    squareg.opacity = (315 - squareg.tag.counter) / 15;
                }
                if (squareg.tag.counter >= 315) {
                    squareg.destroy();
                }
                //modified()変更をゲームに通知
                squareg.modified();
            });
            scene.append(squareg);//追加・描画
        }
        //開始時に何か置いとかないといけない              
        if (param.isAtsumaru) {//Retryボタン(param.isAtsumaru)
            var buttonretry = new g.FilledRect({//ボタン(retry)
                scene: scene,
                cssColor: "black",
                x: -108 + ((g.game.width)),
                y: 320,
                width: 96,
                height: 32,
                touchable: true,
            });
            var buttonretry2 = new g.FilledRect({//ボタン(retry)
                scene: scene,
                cssColor: "white",
                x: 3,
                y: 3,
                width: 90,
                height: 26,
            });
            var textretry = new g.Label({//文字(retry)
                scene: scene,
                font: font,
                fontSize: 16,
                text: "Retry",
                tag: { sum: 0 },
                x: 8,
                y: 6,
            });
            buttonretry.append(buttonretry2);
            buttonretry.append(textretry);
            scene.append(buttonretry);            
            buttonretry.pointDown.add(function () {//ボタン(retry)推したとき
                squareme.x=(g.game.width - playersize) / 2,
                squareme.y=(g.game.height - playersize) / 2,
                g.game.vars.gameState.score = 0;
                for (var i = 0; i < scene.children.length; i++) {//全オブジェクトを探索
                    if (haikei !== scene.children[i] && squareme !== scene.children[i] && scoreLabel !== scene.children[i] && timerLabel !== scene.children[i] && rule !== scene.children[i]&& buttonretry !== scene.children[i]) {//接触判定
                        scene.children[i].destroy();
                        i--;
                    }
                }
                timeall= ((ruletime)*g.game.fps-1)              
                window.RPGAtsumaru.globalServerVariable.triggerCall(2237);
            });
            buttonretry.update.add(function () {
                if(timeall>=((time+ruletime)*g.game.fps)+10){
                    buttonretry.show();  
                }else{
                    buttonretry.hide();   
                }
            });
            
        }      
        var updateHandler = function () {
            if(timeall>=((ruletime)*g.game.fps-10)){
                rule.opacity = 0;
            }
            if ((timeall) >= (ruletime * g.game.fps) && (timeall) <= ((ruletime + time) * g.game.fps)) {
                if ((timeall - ruletime * g.game.fps) >= (g.game.fps * 40) && ((timeall - ruletime * g.game.fps) % 5) == 0) {
                    generatesquarer();
                } else if (((timeall - ruletime * g.game.fps) % 10) == 0) {
                    generatesquarer();
                }
                if ((timeall - ruletime * g.game.fps) >= (g.game.fps * 10) && ((timeall - ruletime * g.game.fps) % 20) == 0) {
                    generatesquareb();
                }
                if ((timeall - ruletime * g.game.fps) >= (g.game.fps * 30) && ((timeall - ruletime * g.game.fps) % 60) == 0) {
                    generatesquareg();
                }
            }      
            // カウントダウン処理
            if(timeall<=(ruletime*g.game.fps)){//開始前
                timerLabel.text = ""+time+".0";
            } else if (timeall > ((time + ruletime) * g.game.fps)) {//終了時
                timerLabel.text = ""+"0.0";
            } else {
                updateStatus()
            }
            timerLabel.invalidate();
            scoreLabel.invalidate();
            if (timeall==((time+ruletime)*g.game.fps)+1) {
                // RPGアツマール環境であればランキングを表示します
                if (param.isAtsumaru) {
                    var boardId_1 = 1;
                    window.RPGAtsumaru.experimental.scoreboards.setRecord(boardId_1, g.game.vars.gameState.score).then(function () {
                        window.RPGAtsumaru.experimental.scoreboards.display(boardId_1);
                    });
                }
            }
            timeall++;
        };
        scene.update.add(updateHandler);
        // ここまでゲーム内容を記述します
    });
    g.game.pushScene(scene);
}
exports.main = main;