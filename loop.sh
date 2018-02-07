while true
do
    SECONDS=0
    npm run fetch
    npm run performance
    npm run deploylive
    echo "$SECONDS"
    echo "Waiting..."
    sleep 300-$SECONDS
    echo "Running..."
done