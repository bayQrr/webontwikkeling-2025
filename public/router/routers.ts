import { Router } from 'express';
import { Characters } from '../../interface';
import { getCharacters, searchAndSortCharacters, sortFields, sortDirections,getCharacterById, updateCharacter, loginUser, registerUser} from '../../database';
import dotenv from "dotenv";

dotenv.config();

const router = Router();
router.get("/", async (req, res) => {
    try {
        if (req.session.user) {
            const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
            const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : 'asc';
            
            const searchQuery = typeof req.query.q === "string" ? req.query.q : "";
            
            const numericSortDirection = sortDirection === 'asc' ? 1 : -1;
            
            const characters = await searchAndSortCharacters(sortField, numericSortDirection, searchQuery);
            
            res.render("index", { 
                user: req.session.user,
                characters: characters,
                sortFields: sortFields,
                sortDirections: sortDirections,
                sortField: sortField,
                sortDirection: sortDirection,
                q: searchQuery
            }); 
    } else {
        res.redirect("/login");
    }
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal server error');
    }
});

router.get("/teams", async (req, res) => {
    const data = await getCharacters();
    res.render("teams", { 
        characters: data,
        user: req.session.user
    }); 
});

router.get("/cards", async (req, res) => {
    const data = await getCharacters();
    res.render("cards", { characters: data,
        role: req.session.user?.role,
        user: req.session.user
    });
});

router.get("/characters/:id", async (req, res) => {
    const data = await getCharacters();
    const characterId = req.params.id;

    const characters: Characters[] = data.filter((character: Characters) => character.id === characterId);
    if (!characters) {
        return res.status(404).send("Character not found");
    }
        res.render("cards", { characters: characters,
        role: req.session.user?.role,
        user: req.session.user
         });
});

router.get("/characters/:id/edit", async (req, res) => {
    const characterId = req.params.id;
    try {
        const character = await getCharacterById(characterId);
        if (!character) {
            return res.status(404).send("Character not found");
        }
        res.render("editCards", { character: character,
            user : req.session.user
        });
    } catch (error) {
        console.error('Error fetching character:', error);
        res.status(500).send('Internal server error');
    }
});

router.post("/characters/:id/edit", async (req, res) => {
    const characterId = req.params.id;
    const updatedCharacterData = req.body as Characters; 

    let roleSymbolURL = "";
    switch (updatedCharacterData.role) {
        case "Duelist":
            roleSymbolURL = "https://raw.githubusercontent.com/bayQrr/api/refs/heads/main/assets/Duelist.png";
            break;
        case "Initiator":
            roleSymbolURL = "https://raw.githubusercontent.com/bayQrr/api/refs/heads/main/assets/Initiator.png";
            break;
        case "Controller":
            roleSymbolURL = "https://raw.githubusercontent.com/bayQrr/api/refs/heads/main/assets/Controller.png";
            break;
        case "Sentinel":
            roleSymbolURL = "https://raw.githubusercontent.com/bayQrr/api/refs/heads/main/assets/Sentinel.png";
            break;
    }

    updatedCharacterData.roleSymbol = roleSymbolURL;
    try {
        await updateCharacter(characterId, updatedCharacterData);
        res.redirect("/"); 
    } catch (error) {
        console.error('Error updating character:', error);
        res.status(500).send('Internal server error');
    }
});

router.get("/login", async (req, res) => {
    res.render("login");
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await loginUser(username, password);
        if (user) {
            req.session.user = { 
                username: user.username, 
                password: user.password,
                role: user.role 
            };
            return res.redirect('/');
        } else {
            return res.render('login', {
                message: 'Foute gebruikersnaam of wachtwoord!',
            });
        }
    } catch (error) {
        console.error('Er is een fout opgetreden tijdens het inloggen:', error);
        return res.redirect('/login');
    }
});

router.post("/logout", async (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});
router.get("/registreer", async (req,res)=>{
    res.render("registreer")
})
router.post('/registreer', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    try {
        if (password !== confirmPassword) {
            return res.render('registreer', {
                message: 'Wachtwoorden komen niet overeen.'
            });
        }
        await registerUser(username, password,"USER");
        res.redirect('/login');
    } catch (error) {
        console.error('Er is een fout opgetreden tijdens het registreren:', error);
        res.render('registreer', {
            message: 'Gebruikersnaam is al in gebruik.'
        });
    }
});

router.get("/teams/:id", async (req, res) => {
    const data = await getCharacters();
    const characterId = req.params.id;
    const characters: Characters[] = data.filter((character: Characters) => character.id === characterId);
    if (!characters) {
        return res.status(404).send("Character not found");
    }
        res.render("teamCards", { characters: characters,
            user : req.session.user
         });
});

export default router;