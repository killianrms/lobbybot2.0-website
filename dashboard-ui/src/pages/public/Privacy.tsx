import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Politique de Confidentialité</h1>
        <p className="mt-1 text-sm text-muted-foreground">LobbyBot 2.0 — Dernière mise à jour : 14 juillet 2026</p>
      </div>

      <p className="text-muted-foreground">
        La présente Politique de Confidentialité décrit comment LobbyBot 2.0 (le « Service »), exploité par Aeroz
        (l'« Éditeur »), collecte, utilise et protège vos données lorsque vous utilisez notre bot Discord et notre
        dashboard web.
      </p>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">1. Données que nous collectons</h2>
        <p className="text-sm text-muted-foreground">Nous collectons uniquement les données nécessaires au fonctionnement du Service :</p>
        <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Identifiant Discord</strong> : votre ID utilisateur Discord, pour associer vos préférences et actions.</li>
          <li><strong className="text-foreground">Données de compte Epic/Fortnite</strong> : lorsque vous vous connectez via <code className="rounded bg-muted px-1 font-mono">/login</code>, nous stockons les jetons d'authentification de l'appareil (device auth : deviceId, accountId, secret) permettant au bot d'agir en votre nom. Nous ne stockons jamais votre mot de passe Epic Games.</li>
          <li><strong className="text-foreground">Préférences</strong> : par exemple la langue choisie.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">2. Comment nous utilisons vos données</h2>
        <p className="text-sm text-muted-foreground">Vos données servent exclusivement à :</p>
        <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          <li>Fournir les fonctionnalités du Service (ajout d'amis, gestion de party, cosmétiques) ;</li>
          <li>Authentifier les bots auprès d'Epic Games ;</li>
          <li>Mémoriser vos préférences.</li>
        </ul>
        <p className="text-sm text-muted-foreground">Nous ne vendons, ne louons et ne partageons jamais vos données avec des tiers à des fins commerciales.</p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">3. Stockage et sécurité</h2>
        <p className="text-sm text-muted-foreground">
          Vos données sont stockées dans une base de données privée. Les accès au dashboard d'administration sont
          protégés par authentification (mot de passe haché avec bcrypt) et par des mécanismes de sécurité (sessions
          signées, limitation des tentatives de connexion). Malgré nos efforts, aucune méthode de transmission ou de
          stockage n'est totalement sécurisée.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">4. Conservation des données</h2>
        <p className="text-sm text-muted-foreground">
          Nous conservons vos données tant que votre compte est actif. Vous pouvez supprimer l'ensemble de vos
          données à tout moment en utilisant la commande <code className="rounded bg-muted px-1 font-mono">/logout</code> sur le bot Discord, ce qui efface vos
          jetons d'authentification et informations associées.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">5. Vos droits</h2>
        <p className="text-sm text-muted-foreground">
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
          La commande <code className="rounded bg-muted px-1 font-mono">/logout</code> vous permet d'exercer directement votre droit à l'effacement. Pour toute autre
          demande, contactez l'Éditeur.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">6. Services tiers et paiements</h2>
        <p className="text-sm text-muted-foreground">
          Le Service interagit avec Discord et Epic Games. L'utilisation de ces plateformes est soumise à leurs
          propres politiques de confidentialité respectives. Nous vous invitons à les consulter.
        </p>
        <p className="text-sm text-muted-foreground">
          Si vous souscrivez à l'abonnement « LobbyBot Premium », le paiement est intégralement traité par Discord.
          Nous ne collectons ni ne stockons aucune information de paiement (numéro de carte bancaire, coordonnées
          bancaires, etc.). Nous recevons uniquement votre statut d'abonnement (actif ou inactif) afin de débloquer
          ou retirer les avantages Premium.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">7. Données des mineurs</h2>
        <p className="text-sm text-muted-foreground">
          Le Service n'est pas destiné aux personnes de moins de 13 ans (ou l'âge minimum légal dans votre pays).
          Nous ne collectons pas sciemment de données concernant des mineurs.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">8. Modifications</h2>
        <p className="text-sm text-muted-foreground">
          Cette Politique peut être mise à jour à tout moment. Les modifications prennent effet dès leur publication
          sur cette page.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">9. Contact</h2>
        <p className="text-sm text-muted-foreground">
          Pour toute question relative à cette Politique ou à vos données, contactez l'Éditeur via le serveur
          Discord officiel du Service.
        </p>
      </section>

      <Link to="/terms" className="inline-block text-sm text-primary hover:underline">
        ← Conditions d'Utilisation
      </Link>
    </article>
  );
}
