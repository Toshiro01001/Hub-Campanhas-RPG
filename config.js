/* config.js · Firebase da enquete (projeto hub-de-campanhas)
   Com isto preenchido, a enquete sai do modo local e passa a contar os votos de todos.
   A apiKey do Firebase é pública por natureza; quem protege os dados são as regras do Realtime Database
   (regras-firebase-hub.json) e o login anônimo. */
window.HUB_FIREBASE = {
  apiKey: "AIzaSyAV3bp_uKCeUU7mASoaSd-ZZiG3vs74eDY",
  authDomain: "hub-de-campanhas.firebaseapp.com",
  databaseURL: "https://hub-de-campanhas-default-rtdb.firebaseio.com",
  projectId: "hub-de-campanhas",
  storageBucket: "hub-de-campanhas.firebasestorage.app",
  messagingSenderId: "439221388180",
  appId: "1:439221388180:web:eda64bab974972474cc581",
  measurementId: "G-TQBS6RMZ7K"
};
