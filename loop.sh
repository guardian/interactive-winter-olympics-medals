while true
do
    SECONDS=0
    npm run fetch
    npm run performance
    npm run deploylive
    echo "$SECONDS"
    echo "Waiting..."
    SLEEP=`expr 300 - $SECONDS`
    sleep $SLEEP
    echo "Running..."
done