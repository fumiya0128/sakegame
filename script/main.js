"use strict";
function main(param) {
    var random = param.random;
    var scene = new g.Scene({
        game: g.game,
        assetIds: ["font16_1", "glyph_area_16"]
    });
    var frameCount = 0;//累計フレーム
    var frameCount2 = 0;
    g.game.vars.gameState = {//スコア初期値
        score: 0
    };
    var gameTimeLimit = 50; //秒数
    var atumar = 1;//アツマール判定
    scene.message.add(function (msg) {
        if (msg.data && msg.data.type === "start" && msg.data.parameters && msg.data.parameters.totalTimeLimit) {
            gameTimeLimit = msg.data.parameters.totalTimeLimit - 10;//新市場用秒数
            atumar = 0;
        }
    });
    var playersize = 16;//自機サイズ
    scene.loaded.add(function () {
        var haikei = new g.FilledRect({
            scene: scene,
            cssColor: "white",
            width: g.game.width,
            height: g.game.height,
        });
        if (atumar == 1) {
            scene.append(haikei);
        }
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
            text: "" + g.game.vars.gameState.score,
            x: g.game.width - 16 * 5,  // 右端に10文字くらい表示できるように配置
            y: 0
        });
        scene.append(scoreLabel);
        var timerLabel = new g.Label({//時間表示
            scene: scene,
            font: font,
            fontSize: 16,
            text: "1234567890",
            x: 0,   // 左端に配置
            y: 0
        });
        scene.append(timerLabel);
        var squareme = new g.FilledRect({//自機
            scene: scene,
            cssColor: "black",
            x: (g.game.width - playersize) / 2,
            y: (g.game.height - playersize) / 2,
            width: playersize,
            height: playersize,
        });
        scene.append(squareme);
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
        scene.update.add(function (e) {//四角形の生成
            if (frameCount >= (g.game.fps * 40) && (frameCount % 5) == 0) {
                generatesquarer();
            } else
                if ((frameCount % 10) == 0) {
                    generatesquarer();
                }
            if (frameCount >= (g.game.fps * 10) && (frameCount % 20) == 0) {
                generatesquareb();
            }
            if (frameCount >= (g.game.fps * 30) && (frameCount % 60) == 0) {
                generatesquareg();
            }
        });
        scene.update.add(function (e) {//接触判定と減点
            for (var i = 0; i < scene.children.length - 1; i++) {//全オブジェクトを探索
                if (haikei !== scene.children[i] && squareme !== scene.children[i] && scoreLabel !== scene.children[i] && timerLabel !== scene.children[i] && g.Collision.intersectAreas(squareme, scene.children[i]) && scene.children[i].opacity == 1.0) {//接触判定
                    if (Math.floor(gameTimeLimit * 10 - frameCount / g.game.fps * 10) > 0) {
                        if ("red" == scene.children[i].cssColor) {//色を判定
                            g.game.vars.gameState.score -= 70;
                        } else if ("blue" == scene.children[i].cssColor) {
                            g.game.vars.gameState.score -= 300;
                        } else if ("green" == scene.children[i].cssColor) {
                            g.game.vars.gameState.score -= 1000;
                        }
                    }
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
            if (Math.floor(gameTimeLimit * 10 - frameCount / g.game.fps * 10) <= 0) {
                scene.update.remove(updateStatus); //時間切れでupdateStatusを消す
            }
            ++frameCount;
            updateTimerLabel();
        }
        scene.update.add(updateStatus);
        function updateTimerLabel() {//タイマー更新
            var s = Math.floor(gameTimeLimit * 10 - frameCount / g.game.fps * 10);
            var text = Math.floor(gameTimeLimit * 10 - frameCount / g.game.fps * 10) / 10 + (s % 10 === 0 ? ".0" : "");
            if (timerLabel.text != text) {//表示と実際の時間が違うときに更新
                timerLabel.text = text;
                timerLabel.invalidate();
            }
        }
        // 敵情報
        function generatesquarer() {//赤四角(バウンド)
            var edge = g.game.random.get(16, 32);
            var squarer = new g.FilledRect({
                scene: scene,
                cssColor: "red",
                width: edge,
                height: edge,
                x: g.game.random.get(0, 1) * (g.game.width) - edge / 2,
                y: g.game.random.get(0, 1) * (g.game.height) - edge / 2,
                opacity: 1.0
            });
            squarer.tag = {
                counter: 0,//四角が生成されてからのフレーム数
                xplus: "true",
                yplus: "true",
                xyspeed: g.game.random.get(3, 8),//速度
                xyangle: g.game.random.get(1, 89) / 90 * Math.PI / 2,//角度
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
            var edge = g.game.random.get(16, 32);
            var squareb = new g.FilledRect({
                scene: scene,
                cssColor: "blue",
                width: edge,
                height: edge,
                x: g.game.random.get(0, 1) * (g.game.width) - edge / 2,
                y: g.game.random.get(0, 1) * (g.game.height) - edge / 2,
                opacity: 1
            });
            squareb.tag = {
                counter: 0,//四角が生成されてからのフレーム数
                xyspeed: g.game.random.get(3, 5),//速度
                xyangle: (g.game.random.get(1, 89) / 180 + g.game.random.get(0, 3) / 2) * Math.PI//角度
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
            var edge = g.game.random.get(16, 32);
            var squareg = new g.FilledRect({
                scene: scene,
                cssColor: "green",
                width: edge,
                height: edge,
                x: g.game.random.get(0, 1) * (g.game.width) - edge / 2,
                y: g.game.random.get(0, 1) * (g.game.height) - edge / 2,
                opacity: 1
            });
            squareg.tag = {
                counter: 0,//四角が生成されてからのフレーム数
                xyspeed: g.game.random.get(2, 5),//速度
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
        // ここまでゲーム内容を記述します
        scene.update.add(function () {
            if (frameCount2==(gameTimeLimit * g.game.fps)&&atumar == 1&&window !== undefined && window.RPGAtsumaru) {
                window.RPGAtsumaru.experimental.scoreboards.setRecord(1, g.game.vars.gameState.score);
            }
            if (frameCount2==(gameTimeLimit * g.game.fps+30)&&atumar == 1&&window !== undefined && window.RPGAtsumaru) {
                window.RPGAtsumaru.experimental.scoreboards.display(1);
            }
            frameCount2++;
        });
    });
    g.game.pushScene(scene);

}
module.exports = main;
