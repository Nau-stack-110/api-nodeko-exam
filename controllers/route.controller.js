const { Route } = require('../models');

const createRoute = async (req, res) =>{
    const routes = {
        depart_city :req.body.depart_city,
        arrival_city:req.body.arrival_city,
        date_depart:req.body.date_depart,
        time_travel:req.body.time_travel,
    }
    try {
        const route = await Route.create(routes);
        res.status(201).json(route);
    } catch (e) {
        res.status(400).json({
            e:'erreur lors de la création d\'un route'
        });
    }
}

const updateRoute  = async (req, res) =>{
  const id = req.params.id;
  const routes = {
    depart_city :req.body.depart_city,
    arrival_city:req.body.arrival_city,
    date_depart:req.body.date_depart,
    time_travel:req.body.time_travel,
  }
    try {
        const route = await Route.update(routes, {where :{id:id}});
        if (!route) {
            res.status(404).json({
                message:"Route not found !"
            }); 
        }
        return res.status(200).json({message:"route mise à jour avec succès!", routes});
    } catch (e) {
        res.status(500).json({
            e:'erreur lors de la mise à jour de ce taxibe'
        }); 
    }
}

const deleteRoute  = async (req, res) =>{
  const id = req.params.id;
  try {
      const route = await Route.destroy({where : {id:id}});
      if (!route) {
          res.status(404).send({
              message:"Route not found !"
          }); 
      } else {
          res.status(200).send({
              message:"Route supprimée avec succès!"
          });
      }
  } catch (e) {
      res.status(500).send({
          e:'erreur lors de l\'effacement de ce Route'
      });
  }
}

const getRouteById  = async (req, res) =>{
  const id = req.params.id;
  try {
      const route = await Route.findByPk(id);
      if(!route){
          res.status(404).send({
              message:"Route not found !"
          });
      }else{
          res.status(200).send(route);
      }
  } catch (e) {
      res.status(500).send({
          e:'erreur lors de la récuperation de ce Route'
      });
  }
}

const searchRoute = async () => {
   const { depart_city, arrival_city } = req.query;
  try {
    const routes = await Route.findAll({
      where: {
        depart_city: depart_city,
        arrival_city: arrival_city
      }
    });
    if (routes.length === 0) {
      return res.status(404).json({ message: "Aucune route trouvée pour ces villes." });
    }
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la recherche des routes", error });
  }
}

const getAllRoute  = async (req, res) =>{
    try {
        const routes = await Route.findAll();
        res.status(200).json(routes);
      } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des routes", error });
      }
}

module.exports = {
    createRoute:createRoute,
    updateRoute:updateRoute,
    deleteRoute:deleteRoute,
    getAllRoute:getAllRoute,
    getRouteById:getRouteById,
    searchRoute:searchRoute
}