<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ILIENI-INVEST</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-image: url('https://emanuelile.github.io/ILIENI-INVEST/fundal.webp');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      height: 100vh;
      font-family: Arial, sans-serif;
      color: white;
      text-align: center;
      text-shadow: 1px 1px 3px black;
    }

    h1 {
      padding-top: 50px;
    }

    input[type="text"] {
      padding: 8px;
      width: 90%;
      max-width: 400px;
      margin-top: 20px;
      border: none;
      border-radius: 5px;
    }

    ul {
      padding: 0;
      margin-top: 20px;
      list-style: none;
    }

    li {
      margin: 10px 0;
    }

    img {
      max-width: 150px;
      margin-top: 5px;
    }
  </style>
  <link rel="icon" href="data:,">
</head>
<body>

  <h1>Bun venit la ILIENI-INVEST!</h1>

  <!-- Căutare produse -->
  <input type="text" id="searchInput" onkeyup="searchProducts()" placeholder="Căutare produs...">
  <ul id="productList"></ul>

  <script>
    // Căutare în lista de produse
    function searchProducts() {
      const input = document.getElementById("searchInput").value.toLowerCase();
      const items = document.querySelectorAll("#productList li");
      items.forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(input) ? "block" : "none";
      });
    }

    // Exemplu de produse (înlocuiești cu Firebase mai târziu)
    const produse = [
      {
        nume: "Produs Test",
        descriere: "Descriere exemplu",
        pret: "120 RON",
        imagine: "https://via.placeholder.com/150"
      }
    ];

    const productList = document.getElementById("productList");

    produse.forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${p.nume}</strong><br>
        <em>${p.descriere}</em><br>
        <span>Preț: ${p.pret}</span><br>
        <img src="${p.imagine}" alt="${p.nume}"><br><hr>
      `;
      productList.appendChild(li);
    });
  </script>

</body>
</html>
