let canvas; //canvas要素 (描画領域)
      let engine; //Babylon.jsによる描画機能
      let scene; //仮想3D空間
      //ページの読み込み終了後に各種初期化を行う
      window.onload = function() {
        //描画領域(canvas要素)をHTMLから取得
        canvas = document.getElementById("renderCanvas");
        //Babylon.jsを使ってcanvasに描画する準備 (引数：描画先,アンチエイリアス)
        engine = new BABYLON.Engine(canvas, true);
        //カメラやライトの設定を行ったscene(3D空間)を作成
        createScene(); 
        //描画オブジェクトの作成
        addObjects();     
        //XRモードの初期化
        initializeXR();        
        //毎フレーム描画を更新
        engine.runRenderLoop(function () {
          if (scene && scene.activeCamera) {
            scene.render();
          }
        });        
      }
      //3D空間の初期化
      function createScene() {
        //3D空間を作成
        scene = new BABYLON.Scene(engine);
        //背景色を設定
        scene.clearColor = new BABYLON.Color3.Black();
        //Lightを設定 (引数：名前,反射の方向,追加先)
        let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, -0.5));
        //カメラを作成(引数：名前, alpha, beta, 注視点からの距離, 注視点,追加先) 
        let camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2,Math.PI/2, 3, new BABYLON.Vector3(0, 0, 0));
        //マウスやキーボードによるカメラ操作を可能にする
        camera.attachControl(canvas, true);        
      }
      //WebXRの初期化
      async function initializeXR(){
        let xr = await scene.createDefaultXRExperienceAsync(
          {
            uiOptions: {
              sessionMode: 'immersive-ar'}
          });
        //XRモード利用可能か不可かを確認
        if (!xr.baseExperience) {}
        else {
          //利用可能な場合はハンドトラッキングをオンにする 
          xr.baseExperience.featuresManager.enableFeature(BABYLON.WebXRFeatureName.HAND_TRACKING, "latest", {
            xrInput: xr.input
          });
          //カメラの初期位置を調整
          xr.baseExperience.sessionManager.onXRFrameObservable.addOnce(() => {
            xr.baseExperience.camera.position = new BABYLON.Vector3(0,scene.activeCamera.position.y,-2);
          });   
        }        
      }
      //表示オブジェクトの初期化
      function addObjects(){     
        //箱状のオブジェクト作成(30cm)
        let box = BABYLON.MeshBuilder.CreateBox("box", {width: 0.3, height: 0.3, depth: 0.3});  
        box.position.x = 0;
        box.position.y = 1;
        //箱の色をランダムに設定
        let boxMaterial = new BABYLON.StandardMaterial("material");
        boxMaterial.diffuseColor = BABYLON.Color3.Random();
        box.material = boxMaterial; 
        //boxに手で掴んで移動できる属性を追加
        let dragBehavior = new BABYLON.SixDofDragBehavior();
        //片手での操作のみ受け付ける(両手でのスケールでの挙動がおかしいため)
        dragBehavior.allowMultiPointer=false;
        //離れた位置からポインターで操作する場合は位置のみ追従
        dragBehavior.rotateWithMotionController=false;
        //上記設定をboxに適用
        box.addBehavior(dragBehavior); 
        //SceneLoaderを使って3Dモデルを読み込む
        BABYLON.SceneLoader.LoadAssetContainer(
          "slim_3Dmodel.glb", //3Dモデルが置かれたフォルダ or 3DモデルのURL
          "slim_3Dmodel.glb", //3Dモデルのファイル名。上記でモデルのURLを指定した場合は空でOK
          scene, //オブジェクトを追加する先のScene 
          function (container) {
            //Babylon.jsでは0番目のメッシュはただのroot。1番目にモデルの実体。
            let glbMesh = container.meshes[1];
            //スケールを10倍
            glbMesh.scaling=new BABYLON.Vector3(0.1,0.1,0.1);  
            //Y軸(=鉛直方向の軸)を中心に180度(=πラジアン)回転
            glbMesh.rotation =new BABYLON.Vector3(0, 0, 0);    
            //読み込んだオブジェクト用にマニピュレーションの挙動を作成
            let dragBehavior2 = new BABYLON.SixDofDragBehavior();
            dragBehavior2.allowMultiPointer=false;
            dragBehavior2.rotateWithMotionController=false;
            glbMesh.addBehavior(dragBehavior2);             
            //scene(3D空間)にオブジェクトを追加
            scene.addMesh(glbMesh);
          }
        );        
      }  
