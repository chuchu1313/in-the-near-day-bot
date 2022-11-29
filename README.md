# in-the-near-day-bot

A telegram bot that counts down to a given time. Automatically send the left day every 12:00 AM.

You could find it at t.me/InTheNearDayBot.

# Usage
<img width="447" alt="iShot_2022-11-27_14 10 34" src="https://user-images.githubusercontent.com/19342103/204121817-5fab3860-792b-4549-a55f-c5c9c0a4406b.png">

# How to buld ?
```
pack build --builder=gcr.io/buildpacks/builder:v1 --publish wei840222/in-the-near-day-bot:1
```

# How to deploy ?
```
kn ksvc apply --namespace=chuchu1313 --image=wei840222/in-the-near-day-bot:1 --scale-min=1 in-the-near-day-bot
```

# How to deploy by tekton ?
```
kubectl apply -k .tekton
```