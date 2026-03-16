{ pkgs, ... }: {

  channel = "stable-24.05";

  packages = [

    pkgs.git

    # Node / NextJS
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.pnpm

    # PHP / Laravel
    pkgs.php82
    pkgs.php82Packages.composer

    # Python / AI Engine
    pkgs.python311
    pkgs.python311Packages.pip

    # Database
    pkgs.postgresql_15

    # Cache
    pkgs.redis

    # CLI tools
    pkgs.curl
    pkgs.wget
    pkgs.unzip
  ];

  env = {
    APP_ENV = "local";
  };

  idx = {

    extensions = [
      "google.gemini-cli-vscode-ide-companion"
      "bmewburn.vscode-intelephense-client"
      "esbenp.prettier-vscode"
      "ms-python.python"
      "bradlc.vscode-tailwindcss"
      "onecentlin.laravel-blade"
      "amiralizadeh9480.laravel-extra-intellisense"
    ];

    previews = {
      enable = true;
      previews = {
        web = {
          command = ["php" "artisan" "serve" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };

    workspace = {

      onCreate = {

        init-git = ''
          git init
        '';

        install-dependencies = ''
          if [ -f "composer.json" ]; then
            composer install
          fi
          if [ -f "package.json" ]; then
            npm install
          fi
          if [ -f "requirements.txt" ]; then
            pip install -r requirements.txt
          fi
        '';

        default.openFiles = [
          ".idx/dev.nix"
          "README.md"
        ];

      };

      onStart = {

      };

    };

  };

}