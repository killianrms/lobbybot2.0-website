import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Conditions d'Utilisation</h1>
        <p className="mt-1 text-sm text-muted-foreground">LobbyBot 2.0 — Dernière mise à jour : 14 juillet 2026</p>
      </div>

      <p className="text-muted-foreground">
        Bienvenue sur LobbyBot 2.0 (le « Service »), exploité par Aeroz (l'« Éditeur »). En utilisant notre bot
        Discord, notre dashboard web ou tout service associé, vous acceptez les présentes Conditions d'Utilisation.
        Si vous n'êtes pas d'accord, veuillez ne pas utiliser le Service.
      </p>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">1. Description du Service</h2>
        <p className="text-sm text-muted-foreground">
          LobbyBot 2.0 est un service permettant de gérer des bots Fortnite (« LobbyBots ») via Discord et une
          interface web. Le Service permet notamment d'ajouter des bots en amis, de gérer des salons (party) et de
          personnaliser des cosmétiques dans le jeu.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">2. Utilisation acceptable</h2>
        <p className="text-sm text-muted-foreground">En utilisant le Service, vous vous engagez à :</p>
        <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          <li>Ne pas utiliser le Service à des fins illégales ou frauduleuses ;</li>
          <li>Ne pas tenter de perturber, surcharger ou compromettre l'infrastructure du Service ;</li>
          <li>Respecter les Conditions d'Utilisation d'Epic Games et de Discord ;</li>
          <li>Ne pas utiliser le Service pour harceler, spammer ou nuire à autrui.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">3. Comptes et accès</h2>
        <p className="text-sm text-muted-foreground">
          L'accès au dashboard d'administration est réservé aux personnes autorisées par l'Éditeur. Vous êtes
          responsable de la confidentialité de vos identifiants de connexion et de toute activité effectuée depuis
          votre compte.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">4. Relation avec Epic Games</h2>
        <p className="text-sm text-muted-foreground">
          LobbyBot 2.0 n'est ni affilié, ni approuvé, ni sponsorisé par Epic Games, Inc. « Fortnite » est une marque
          déposée d'Epic Games. L'utilisation de comptes Fortnite via le Service se fait sous votre seule
          responsabilité.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">5. Disponibilité et limitation de responsabilité</h2>
        <p className="text-sm text-muted-foreground">
          Le Service est fourni « en l'état », sans garantie d'aucune sorte. L'Éditeur ne pourra être tenu
          responsable de toute interruption de service, perte de données, sanction appliquée à un compte
          Fortnite/Discord, ou tout dommage direct ou indirect résultant de l'utilisation du Service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">6. Abonnements Premium</h2>
        <p className="text-sm text-muted-foreground">
          Le Service propose un abonnement payant optionnel (« LobbyBot Premium ») souscrit via le système
          d'abonnement de Discord. En y souscrivant, vous acceptez les points suivants :
        </p>
        <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Facturation récurrente :</strong> l'abonnement est facturé de façon périodique (par exemple mensuelle) et se renouvelle automatiquement jusqu'à son annulation.</li>
          <li><strong className="text-foreground">Annulation :</strong> vous pouvez annuler à tout moment depuis les paramètres d'abonnement de votre compte Discord. L'accès aux avantages Premium reste actif jusqu'à la fin de la période déjà payée, sans reconduction ultérieure.</li>
          <li><strong className="text-foreground">Remboursements :</strong> les paiements et les éventuels remboursements sont traités par Discord, conformément à sa politique de remboursement. Pour toute question, contactez l'Éditeur.</li>
          <li><strong className="text-foreground">Évolution des avantages :</strong> le contenu de l'offre Premium peut évoluer ; l'Éditeur s'efforce de maintenir un niveau d'avantages équivalent ou supérieur.</li>
          <li><strong className="text-foreground">Aucune garantie de résultat :</strong> l'abonnement Premium ne garantit ni la disponibilité permanente d'un bot donné, ni l'absence de sanction éventuelle appliquée par Epic Games à un compte.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">7. Modification des Conditions</h2>
        <p className="text-sm text-muted-foreground">
          L'Éditeur se réserve le droit de modifier ces Conditions à tout moment. Les modifications prennent effet
          dès leur publication sur cette page. Il vous incombe de consulter régulièrement cette page.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">8. Résiliation</h2>
        <p className="text-sm text-muted-foreground">
          L'Éditeur peut suspendre ou résilier votre accès au Service à tout moment, sans préavis, en cas de
          violation des présentes Conditions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="border-l-2 border-primary pl-3 text-base font-semibold text-foreground">9. Contact</h2>
        <p className="text-sm text-muted-foreground">
          Pour toute question relative à ces Conditions, contactez l'Éditeur via le serveur Discord officiel du
          Service.
        </p>
      </section>

      <Link to="/privacy" className="inline-block text-sm text-primary hover:underline">
        Politique de Confidentialité →
      </Link>
    </article>
  );
}
