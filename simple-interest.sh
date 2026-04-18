#!/bin/bash

echo "Calculateur d'intérêt simple"
read -p "Entrez le principal (montant initial) : " principal
read -p "Entrez le taux d'intérêt (en %) : " taux
read -p "Entrez la période (en années) : " periode

interest=$(echo "scale=2; $principal * $taux * $periode / 100" | bc)
echo "L'intérêt simple est : $interest"
