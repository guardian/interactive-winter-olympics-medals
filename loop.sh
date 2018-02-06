while true
do
   npm run fetch
   npm run cleanHistoric
   npm run deploylive
   echo "Waiting 60 minutes"
   sleep 3600
   echo "Running..."
done