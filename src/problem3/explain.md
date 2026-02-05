Problem 3: Wallet Page

1. Missing typing system and has any type.
2. Interface do not inherit at the right way.
3. Switch function don't have an issue. But I prefer to use a map object to handle the case.
4. React.FC is redundant when the component do not have children prop.
5. Using chain function to handle the data flow make it hard to read and debug.
6. The component is not testable. I would prefer to use a pure function to handle the data flow.
7. Do not clean up the memo dependency array. It will cause the component to re-render when the dependency change.
8. Using index as key is not a good practice. It will cause the component to re-render when the item order change.
9. The component should be split into smaller component. WalletRow is a good candidate.
10. I'm using functional programming to handle the data flow. It makes the code more readable and testable.