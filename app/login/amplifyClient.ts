import { Amplify } from 'aws-amplify'

// Only configure Amplify in the browser, not during SSR/prerender
if (typeof window !== 'undefined') {
  Amplify.configure({
    Auth: {
      region: 'eu-west-1',
      userPoolId: 'us-east-1_Dd8MiEw8D',
      userPoolWebClientId: '3h8crv621qpst2r6i9j18im1l8',
    },
  })
}
