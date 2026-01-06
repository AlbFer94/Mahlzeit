import express from "express";
import multer from "multer";
import fs from "fs";
import ejs from "ejs";
import { randomUUID } from "crypto";
import sharp from "sharp";



// Ensure upload directory exists
const imagesDir = 'public/images';
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }});


const app = express();
const port = process.env.PORT || 2000;
app.use(express.static('public'));
app.use('/images', express.static('public/images'));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejs.__express);
app.set("view engine", "ejs");
app.use(express.json());


const posts = [
  {
    id: "cotoletta vegana",
    image: "/images/verdure-e-cotoletta.png",
    title: "🌱 Cotolette vegane con verdure al forno",
    content:"Un piatto semplice, colorato e nutriente che unisce la croccantezza delle cotolette vegane alla dolcezza delle verdure arrostite. Ideale per un pranzo leggero o una cena sana, è perfetto per chi cerca gusto e benessere in ogni boccone.",
    ingredients: "- Cotolette vegane (a base di ceci o soia)\n- Zucchine\n- Peperoni\n- Melanzane\n- Pomodorini\n- Olio d'oliva\n- Erbe aromatiche (rosmarino, timo)\n- Sale e pepe",
    extra:" Preparazione: Preriscalda il forno a 200°C. Taglia le verdure a pezzi e disponile su una teglia, condendole con olio, sale, pepe e erbe aromatiche. Inforna per circa 25-30 minuti, girandole a metà cottura. Nel frattempo, cuoci le cotolette vegane seguendo le istruzioni sulla confezione. Servi le cotolette calde accompagnate dalle verdure al forno.",
  },

  {
    id: "torta salata",
    image: "/images/torta-salata.png",
    title:"🥔 Torta salata con scarola e patate dolci",
    content:"Una torta salata dal cuore autunnale, dove la dolcezza delle patate si fonde con il gusto amarognolo della scarola. Racchiusa in un guscio croccante di pasta sfoglia, questa ricetta è ideale per un pranzo leggero, un antipasto elegante o un picnic fuori stagione. Facile da preparare, bella da vedere e sorprendente da gustare.",
    ingredients: "- Pasta sfoglia\n- Scarola\n- Patate dolci\n- Cipolla\n- Aglio\n- Olio d'oliva\n- Formaggio grattugiato (opzionale)\n- Sale e pepe",
    extra:" Preparazione: Preriscalda il forno a 180°C. Sbuccia e taglia le patate dolci a cubetti, quindi lessale in acqua salata fino a quando saranno tenere. In una padella, soffriggi cipolla e aglio in olio d'oliva, aggiungi la scarola e cuoci fino a quando sarà appassita. Unisci le patate dolci schiacciate alla scarola, aggiusta di sale e pepe. Stendi la pasta sfoglia in una teglia, bucherella il fondo con una forchetta e versa il ripieno. Se desideri, spolvera con formaggio grattugiato. Cuoci in forno per circa 30-35 minuti, o fino a quando la torta sarà dorata e croccante. Lascia intiepidire prima di servire.",
  },

  {
    id: "vellutata di zucca",
    image:"/images/vellutata-zucca.png",
    title:"🎃 Vellutata di zucca e carote con zenzero",
    content:"Una vellutata cremosa e avvolgente che combina la dolcezza naturale della zucca e delle carote con il tocco speziato dello zenzero fresco. Perfetta per riscaldare le serate autunnali o invernali, questa zuppa è un comfort food sano e nutriente, ideale come antipasto o piatto principale leggero.",
    ingredients: "- Zucca\n- Carote\n- Cipolla\n- Aglio\n- Zenzero fresco\n- Brodo vegetale\n- Olio d'oliva\n- Sale e pepe\n- Panna vegetale (opzionale)",
    extra:" Preparazione: In una pentola capiente, scalda l'olio d'oliva e soffriggi cipolla, aglio e zenzero grattugiato fino a quando saranno morbidi. Aggiungi la zucca e le carote tagliate a pezzi, copri con il brodo vegetale e porta a ebollizione. Riduci il fuoco e lascia cuocere per circa 20-25 minuti, o fino a quando le verdure saranno tenere. Utilizza un frullatore a immersione per ridurre la zuppa in una consistenza liscia e cremosa. Aggiusta di sale e pepe, e se desideri, aggiungi un po' di panna vegetale per una vellutata ancora più ricca. Servi calda, guarnita con un filo d'olio d'oliva o semi tostati per un tocco croccante.",
  },

  {
    id: "zuppa orzo",
    image:"/images/zuppa-d'orzo.png",
    title:"🍲 Zuppa d'orzo con funghi e verdure",
    content:"Una zuppa calda e saporita che unisce il sapore del grano all'aroma dei funghi e alla freschezza delle verdure. Ideale per un pranzo riscaldante o una cena confortante, questa zuppa è ricca di sapore e nutriente.",
    ingredients: "- Orzo\n- Funghi (porcini o champignon)\n- Verdure (carote, sedano, cipolla)\n- Brodo vegetale\n- Olio d'oliva\n- Aglio\n- Sale e pepe",
    extra:" Preparazione: In una pentola, scalda l'olio d'oliva e soffriggi aglio e verdure tagliate a cubetti. Aggiungi i funghi tagliati a fette e cuoci fino a quando saranno dorati. Aggiungi l'orzo e cuoci per un minuto. Versa il brodo vegetale, copri e cuoci per circa 20-25 minuti o fino a quando l'orzo sarà tenero. Aggiusta di sale e pepe. Servi calda.",
  },

  {
    id: "zuppa orientale",
    image:"/images/zuppa-orientale.png",
    title:"🍜 Zuppa orientale di noodles con tofu e verdure",
    content:"Una zuppa leggera e saporita che combina noodles morbidi, tofu proteico e verdure croccanti in un brodo aromatico. Perfetta per un pasto veloce ma nutriente, questa zuppa è ispirata ai sapori dell'Asia ed è ideale per chi cerca un comfort food sano.",
    ingredients: "- Noodles (di riso o di grano)\n- Tofu\n- Verdure (carote, zucchine, funghi, spinaci)\n- Brodo vegetale\n- Salsa di soia\n- Zenzero fresco\n- Aglio\n- Olio di sesamo\n- Cipollotto\n- Semi di sesamo (opzionale)",
    extra:" Preparazione: In una pentola, scalda l'olio di sesamo e soffriggi aglio e zenzero grattugiato fino a quando saranno fragranti. Aggiungi le verdure tagliate a julienne e cuoci per qualche minuto. Versa il brodo vegetale e porta a ebollizione. Aggiungi i noodles e cuoci secondo le istruzioni sulla confezione. Nel frattempo, taglia il tofu a cubetti e aggiungilo alla zuppa negli ultimi minuti di cottura. Condisci con salsa di soia a piacere. Servi la zuppa calda, guarnita con cipollotto tritato e semi di sesamo se desideri.",
  },
];

//Server-side storage for user's menu and posts 

//const myList= new Set();
//const myPosts=[];

//server-side list counting middleware
/* app.use((req, res, next) => {
  res.locals.myListCount=myList.size;
  next();
}); */




app.get("/", (req, res) =>{
  const q = req.query.q ? String(req.query.q).toLowerCase() : "";
  const filtered = q
    ? posts.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q)) ||
        (p.ingredients && p.ingredients.toLowerCase().includes(q))
      )
    : posts;
  res.render("index", {posts: filtered, q: req.query.q || ""} );
    });

    app.get("/new", (req, res) => {
      let data = {
        title: "",
        image: "",
        content: "",
        ingredients: "",
        extra: ""
      };
      res.render("new", data);
    });

    //Render routing for user's menu and posts server-side storage

    app.get("/my-menu", (req, res) => {
      /* const listPosts=[...myList].map(id=>posts.find(p=>p.id===id)).filter(Boolean); */
      res.render("my-menu", {posts});
    });

app.get("/my-posts", (req, res) => {
      res.render("my-posts",{posts});
    }); 


//Edit post route Server-side

/*   app.get("/edit-post/:id", (req, res) => {
  const { id } = req.params;
  const post= myPosts.find(post=>post.id===id);
  
  if (!post) {
    console.log("Post not found for editing:", id);
    return res.redirect("/my-posts");
  }
  res.render("new", {
    ...post,
    editId: id
  });
  }); */


   app.post("/submit", upload.single("image"), async (req, res) => {
  try {
    const { title, content, ingredients, extra } = req.body;

    let imagePath = req.body.image || "/images/default.png";

    // Se è stata caricata un'immagine, la processiamo con Sharp
    if (req.file) {
      const inputPath = req.file.path; // file salvato da Multer
      const outputFilename = `${Date.now()}.jpg`;
      const outputPath = `public/images/${outputFilename}`;

      // Elaborazione immagine
      await sharp(inputPath)
        .rotate() // corregge orientamento EXIF
        .resize({ width: 1200 }) // riduce dimensioni
        .jpeg({ quality: 80 }) // comprime e normalizza
        .toFile(outputPath);

      // Elimina il file originale salvato da Multer
      fs.unlinkSync(inputPath);

      // Percorso finale da salvare nel post
      imagePath = `/images/${outputFilename}`;
    }

    const newPost = {
      id: randomUUID(),
      image: imagePath,
      title,
      content,
      ingredients,
      extra
    };

    posts.push(newPost);

    res.redirect("/");
  } catch (error) {
    console.error("Errore durante l'upload:", error);
    res.status(500).send("Errore durante il caricamento dell'immagine");
  }
});


    //Post routes for user's menu and posts server-side storage

    /*app.post("/my-list", (req, res) => {
      const { postId } = req.body;

      myList.add(postId);

      res.redirect("/my-menu");
    }); */

    /* app.post("/remove-from-list", (req, res) => {
      const { postId } = req.body;

      myList.delete(postId);
      
      res.redirect("/my-menu");
    }); */

    /* app.post("/delete-post", (req, res) => {
      const { postId } = req.body;

      myPosts.splice(myPosts.findIndex(p=>p.id===postId), 1);
      posts.splice(posts.findIndex(p=>p.id===postId), 1);

      myList.delete(postId);
      
      res.redirect("/my-posts");
    }); */

/*     app.post("/update-post", upload.single('image'), (req, res) => {
      const {editId,title,content,ingredients,extra}=req.body;
      
      const image = req.file ? '/images/' + req.file.filename : myPosts.find(post=>post.id===editId)?.image;
      const updatedPost = { id:editId, image, title, content, ingredients, extra };

      const myIndex=myPosts.findIndex(post=>post.id===editId);
      if(myIndex!== -1) myPosts[myIndex]=updatedPost;

      const globalIndex=posts.findIndex(post=>post.id===editId);
      if(globalIndex!== -1) posts[globalIndex]=updatedPost;
    
      res.redirect("/my-posts");
    }); */


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


